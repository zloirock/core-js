// destructure rewrite pipeline. covers parameter-default synth-swap entry, top-level
// VariableDeclarator extraction (instance / static / global kinds), AssignmentExpression
// destructure flatten, nested proxy-global flatten (`{Array:{from}} = globalThis` ->
// `const from = _Array$from`), and CatchClause receiver extraction. also owns the per-prop
// AST-mutation pipeline `handleDestructuredProperty` (strategy decided by `planDestructureEmission`,
// executed via babel `replaceWith` / `insertBefore` / `splice`) plus side-effect deferral
// (`deferSideEffect` accumulates into `deferredSideEffects` array drained at programExit).
// public surface: `handleObjectPropertyResult`, `extractCatchClause`, `deferredSideEffects`.
// instantiated per-file in `initFile` so closure-captured per-file state (`skippedNodes` /
// `synthSwap` / `injector` / `debugOutput`) stays in sync with the freshly-allocated values
import {
  findEnclosingFunctionLikePath,
  hasRestSiblingExcept,
  isBindingPosition,
  isFunctionParamDestructureParent,
  isIdentifierPropValue,
  isNonReferencePosition,
  isSynthSimpleObjectPattern,
  isTransparentDestructureWrapper,
  mayHaveSideEffects,
  objectPatternPropNeedsReceiverRewrite,
  peelNestedSequenceExpressions,
  peelToExpressionStatement,
  propBindingIdentifier,
  resolveFallbackReceiverPath,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { canTransformDestructuring as sharedCanTransformDestructuring } from '@core-js/polyfill-provider/detect-usage/destructure';
import { patternBindingName } from '@core-js/polyfill-provider/detect-usage/resolve';
import { classifyVariableDeclarationHost } from '@core-js/polyfill-provider/destructure-host-shape';
import {
  planDestructureEmission,
  STRATEGIES,
} from './destructure-emission-plan.js';

export default function createDestructureEmitter({
  t,
  generateRef,
  generateLocalRef,
  generateUnusedId,
  injector,
  injectPureImport,
  resolvePropertyObjectType,
  resolvedType,
  skippedNodes,
  synthSwap,
  getDebugOutput,
}) {
  // original body index of each declaration, before insertBefore shifts it
  const originalDeclKeys = new WeakMap();
  // per-host bookkeeping for AssignmentExpression cascade emission: chains `insertAfter`
  // on previous polyfill-assignment (preserves declaration order; bare host.insertAfter on
  // every visit would stack subsequent insertions in REVERSE at parent.body[idx+1]) and
  // appends `_unused*` declarators to a shared `var _unused, _unused2;` (single combined
  // statement, not split per visitor). matches unplugin's single-pass emission shape
  const assignHostBookkeeping = new WeakMap();
  function getAssignHostBookkeeping(assignNode) {
    let bk = assignHostBookkeeping.get(assignNode);
    if (!bk) {
      bk = { lastSibling: null, unusedVarDecl: null };
      assignHostBookkeeping.set(assignNode, bk);
    }
    return bk;
  }
  // side-effect expressions from destructuring inits - drained at programExit
  // (re-traverse for nested polyfill detection then splice into the body in source order)
  const deferredSideEffects = [];
  function canTransformDestructuring(path) {
    const parent = path.parentPath?.parentPath;
    if (!sharedCanTransformDestructuring({
      parentType: parent?.node?.type,
      parentInit: parent?.node?.init,
      grandParentType: parent?.parentPath?.parentPath?.node?.type,
    })) return false;
    if (parent?.isAssignmentExpression() && !parent.parentPath?.isExpressionStatement()) return false;
    return true;
  }

  // inline-default `{ p = _polyfill }` - only fires on undefined property. used when
  // synth-swap can't run (complex receiver, rest element, no default wrapper): it misses
  // the buggy-present native case, but preserves receiver evaluation semantics.
  // when value is already an AssignmentPattern (`{from = []}`), swap the user's default
  // expression with the polyfill ID directly - wrapping in another `t.assignmentPattern`
  // produces nested-AssignmentPattern AST which fails @babel/types validation
  // (AssignmentPattern.left expects Identifier / ObjectPattern / ArrayPattern / MemberExpression
  // / TS wrappers). reachable for arrow expr-body + AssignmentPattern + rest sibling, where
  // body-extract bails on the missing BlockStatement
  function emitParamInlineDefault(prop, id) {
    if (t.isAssignmentPattern(prop.node.value)) {
      prop.get('value').get('right').replaceWith(t.cloneNode(id));
      return;
    }
    prop.get('value').replaceWith(t.assignmentPattern(t.cloneNode(prop.node.value), t.cloneNode(id)));
    prop.node.shorthand = false;
  }

  // parameter destructure polyfill. only static/global fit here; instance methods need a
  // receiver. synth-swap when `synthSwap.findTargetPath` identifies a safe Identifier
  // receiver; otherwise inline-default `{p = _polyfill}` (fires only on undefined property).
  // bare param without IIFE / receiver `function({ from }) {}` bails by design - `from`
  // could be ANY value the caller passes, not necessarily Array.from.
  // AssignmentPattern (`{from = []} = Array`): accept both `{key: binding}` and
  // `{key = default}` shapes. the user's default becomes dead code under synth-swap
  // (polyfill id is always defined) but stays syntactically intact in the output
  function handleParameterDestructure({ prop, kind, entry, hintName }) {
    if (kind === 'instance') return;
    if (prop.node.computed || !t.isIdentifier(prop.node.key)) return;
    if (!isIdentifierPropValue(prop.node.value)) return;
    const objectPattern = prop.parentPath;
    const targetPath = isSynthSimpleObjectPattern(objectPattern.node)
      ? synthSwap.findTargetPath(objectPattern?.parentPath, objectPattern) : null;
    if (!targetPath) {
      // synth-swap bailed (computed key / non-Identifier shape sibling) - try body-extract
      // first: insert `const from = _polyfill;` at function body top + remove the prop
      // from the destructure. preserves "polyfill always wins" even at the cost of caller-
      // passed `{from: customFrom}` being ignored (consistent with VariableDeclaration
      // flatten contract). expr-body arrows skipped (no statement slot to host the const)
      if (tryBodyExtractFromParamDestructure(prop, entry, hintName)) return;
      emitParamInlineDefault(prop, injectPureImport(entry, hintName));
      // parity with sibling destructure handlers - replaceWith schedules re-traversal
      // and the next visitor entry must short-circuit on the already-rewritten prop.
      // also mark the new `{p = _polyfill}` AssignmentPattern slot so Identifier visitors
      // walking `prop.node.value` don't re-fire on the synthetic `_polyfill` default
      skippedNodes.add(prop.node);
      if (prop.node.value) skippedNodes.add(prop.node.value);
      return;
    }
    // defer injectPureImport until programExit emits the synth. if a sibling plugin
    // mutates targetPath before then, the swap is skipped and no dead import is left
    synthSwap.registerPolyfill({
      targetPath, objectPatternPath: objectPattern, key: prop.node.key.name, entry, hintName,
    });
  }

  // body-extract fallback when synth-swap can't fire (computed-key sibling / non-Identifier
  // shape / rest sibling): walk up to the enclosing function-like, ensure block body,
  // prepend `const <local> = _polyfill;`. for rest siblings, replace the prop value with
  // `_unused` sentinel so the destructure still consumes the key and rest exclusion
  // survives; otherwise remove the prop entirely. preserves "polyfill always wins"
  // guarantee at the cost of caller-passed `{from: customFrom}` being ignored
  // count leading ExpressionStatements with a `.directive` flag at the start of a function
  // body. these mirror the directive prologue (`'use strict'`, `'use asm'`) for inline-
  // injected forms that the parser didn't lift into `node.directives[]`. inserts that
  // intend to land at the very top of body must skip past these or they demote directives
  // into regular statements (silent strict-mode loss)
  function countLeadingDirectives(body) {
    let count = 0;
    while (count < body.length && body[count]?.type === 'ExpressionStatement' && body[count]?.directive) count++;
    return count;
  }

  function tryBodyExtractFromParamDestructure(prop, entry, hintName) {
    const valueNode = propBindingIdentifier(prop.node.value);
    if (!valueNode) return false;
    const fnPath = findEnclosingFunctionLikePath(prop);
    if (!fnPath || !t.isBlockStatement(fnPath.node.body)) return false;
    const id = injectPureImport(entry, hintName);
    // register the local name -> entry path so receiver-narrowing through this binding
    // (`arr = from('x'); arr.at(-1)`) finds the polyfill's static return type. babel scope
    // tracker may keep the original ObjectProperty binding stale post-AST-mutation, so the
    // structural `staticPairFromDestructure` extractor can't re-derive (Constructor, method)
    // from the renamed `_unused` value - injector alias is the authoritative path
    injector.registerBodyExtractAlias(valueNode.name, entry, prop.scope.getBinding(valueNode.name));
    // `let` (not `const`): the original was a function parameter binding, which is
    // reassignable. swapping in `const` would silently reject downstream `from = newValue`
    // assignments in the body that were valid pre-rewrite.
    // skip past the directive prologue (`'use strict'` ExpressionStatements with
    // `.directive` set): unshifting at body[0] would land the var BEFORE the directive,
    // demoting the directive into a no-op statement and silently flipping the function
    // out of strict mode. babel parser typically lifts directives to `node.directives[]`
    // (separate slot), but inline-injected ExpressionStatements with `.directive` survive
    const newDecl = t.variableDeclaration('let', [
      t.variableDeclarator(t.cloneNode(valueNode), t.cloneNode(id)),
    ]);
    const bodyPath = fnPath.get('body');
    const directiveCount = countLeadingDirectives(bodyPath.node.body);
    if (directiveCount === 0) bodyPath.unshiftContainer('body', newDecl);
    else bodyPath.get('body')[directiveCount - 1].insertAfter(newDecl);
    skippedNodes.add(prop.node);
    if (prop.node.value) skippedNodes.add(prop.node.value);
    if (hasRestSiblingExcept(prop.parent.properties, prop.node)) {
      prop.get('value').replaceWith(generateUnusedId());
      prop.node.shorthand = false;
    } else {
      prop.remove();
    }
    return true;
  }

  // emit `<binding> = <polyfillId>;` ExpressionStatement; both nodes are cloned so
  // sibling re-emits don't share AST identity. used by every "extract polyfill as separate
  // statement" path (simple flatten / cascade / body-extract via varDecl variant)
  function buildPolyfillAssignmentStatement(valueNode, id) {
    return t.expressionStatement(
      t.assignmentExpression('=', t.cloneNode(valueNode), t.cloneNode(id)),
    );
  }

  // build per-SE-expr ExpressionStatements (one per peeled prefix expr) for `insertBefore`.
  // matches unplugin's `cascadeAssignmentExpression` which emits each SE as a standalone
  // `se();` segment - multi-SE chains land as `se1(); se2(); ...` in both pipelines.
  // cloning preserves sibling visitors' path references through AST sub-tree relocation
  function buildSEPrefixStatements(prefix) {
    return prefix.map(e => t.expressionStatement(t.cloneNode(e)));
  }

  // generic SE-prefix lift: peels prefix from `node[key]`, emits ExpressionStatements before
  // `hostPath`, and collapses the slot to the bare tail. used for both VariableDeclarator
  // (`init`) and AssignmentExpression (`right`) hosts. mutating the slot is essential -
  // multiple polyfilled props sharing one SE-bearing receiver each visit independently;
  // without the swap, every visit re-peels the same prefix and duplicates `se();`
  function liftSEPrefixSwap(node, key, hostPath) {
    const { prefix, tail } = peelNestedSequenceExpressions(node[key]);
    if (!prefix.length) return;
    hostPath.insertBefore(buildSEPrefixStatements(prefix));
    node[key] = tail;
  }

  // hoist `_unused` sentinel names into a shared `var _unused, _unused2;` declaration ahead
  // of the destructure host. first call creates the declaration via `insertBefore`, subsequent
  // calls APPEND to the same VariableDeclaration node (single combined statement, not split).
  // matches unplugin's single `var ...;` segment in `cascadeAssignmentExpression`
  function appendUnusedVarDeclarators(bk, exprStmt, names) {
    if (!names.length) return;
    if (!bk.unusedVarDecl) {
      const [path] = exprStmt.insertBefore(t.variableDeclaration('var', []));
      bk.unusedVarDecl = path.node;
    }
    for (const name of names) {
      bk.unusedVarDecl.declarations.push(t.variableDeclarator(t.identifier(name)));
    }
  }

  // chain `insertAfter` on the previous polyfill-assignment (or on the host on first call)
  // so per-visitor emissions land in declaration order. plain `host.insertAfter` on every
  // visit lands at parent.body[idx+1] and stacks subsequent insertions in REVERSE
  function appendPolyfillAssignment(bk, exprStmt, stmt) {
    const anchor = bk.lastSibling ?? exprStmt;
    const [path] = anchor.insertAfter(stmt);
    bk.lastSibling = path;
  }

  // walk chain inner-to-outer applying the rest-aware cascade:
  //   - any rest sibling at this level: replace prop's value with `_unused` sentinel so the
  //     key is still consumed by the destructure (rest exclusion preserved), break (sentinel
  //     terminates the cascade for this branch)
  //   - no rest siblings at this level: safe to remove the prop entirely; if pattern empties
  //     out continue to outer level, otherwise break (outer still has live consumers)
  // returns names of `_unused` ids emitted so callers can hoist `var _unused;` declarations
  // for AssignmentExpression hosts (VariableDeclarator path declares them via the destructure)
  function applyRestAwareCascade(chain) {
    const unusedIds = [];
    for (const { prop: p, pattern } of chain) {
      if (hasRestSiblingExcept(pattern.node.properties, p.node)) {
        const unusedId = generateUnusedId();
        unusedIds.push(unusedId.name);
        p.get('value').replaceWith(unusedId);
        p.node.shorthand = false;
        break;
      }
      p.remove();
      if (pattern.node.properties.length > 0) break;
    }
    return unusedIds;
  }

  // `({Array: {from}, ...} = receiver);` (AssignmentExpression in ExpressionStatement) -
  // unified cascade-rewrite for ALL chain shapes (rest sibling / multi-prop / single-prop):
  // mutate the destructure pattern in-place so each polyfilled key is consumed (replaced with
  // `_unused` sentinel when rest sibling preserves exclusion, otherwise prop removed entirely
  // and cascade continues outer when pattern empties); hoist a shared `var _unused, _unused2;`
  // before the host (LHS slots must be pre-declared; strict-mode otherwise throws); chain
  // each visitor's `name = _polyfill;` after the previous sibling polyfill in declaration
  // order. when the outermost pattern fully empties (all props polyfilled, no rest), the
  // surviving `({} = receiver)` is dead code - last visitor removes the host. preserves
  // "polyfill always wins" - destructure discards the receiver's `Array.from` value into
  // `_unused`, then `from = _polyfill` overrides whatever native (potentially buggy) value
  // would have leaked through inline-default fallback
  function cascadeAssignmentExpressionDestructure({ assignPath, valueNode, prop, chain, entry, hintName, peeled = null }) {
    const exprStmt = peeled?.exprStmt ?? assignPath.parentPath;
    // strip transparent wrappers between the AssignmentExpression and ExpressionStatement
    // (oxc parens / TS casts / chain / SequenceExpression-with-AE-as-tail). SE prefix
    // expressions become side-effect ExpressionStatement siblings before the cascade
    // output. flatten only on the FIRST visit per host so sibling per-prop re-entries
    // don't double-strip the wrappers
    if (peeled && exprStmt.node.expression !== assignPath.node) {
      const prefixStmts = peeled.sequencePrefix.map(e => t.expressionStatement(e));
      exprStmt.node.expression = assignPath.node;
      if (prefixStmts.length) exprStmt.insertBefore(prefixStmts);
    }
    const id = injectPureImport(entry, hintName);
    // see `tryBodyExtractFromParamDestructure` for rationale on body-extract alias
    injector.registerBodyExtractAlias(valueNode.name, entry, assignPath.scope.getBinding(valueNode.name));
    // skip the orphaned prop subtree before mutation so re-entered visitors don't fire on
    // a removed-from-parent node. receiver tail stays visible so its proxy-global Identifier
    // (`globalThis`) can substitute via the normal visitor pass
    t.traverseFast(prop.node, node => { skippedNodes.add(node); });
    liftSEPrefixSwap(assignPath.node, 'right', exprStmt);
    const bk = getAssignHostBookkeeping(assignPath.node);
    appendUnusedVarDeclarators(bk, exprStmt, applyRestAwareCascade(chain));
    appendPolyfillAssignment(bk, exprStmt, buildPolyfillAssignmentStatement(valueNode, id));
    // outer pattern fully emptied (every prop in the host destructure was polyfillable, no
    // rest siblings): the surviving `({} = receiver)` is dead code. SE prefix already lifted
    // above, bare receiver has no observable effect. remove the host. only the visitor that
    // empties the outermost pattern reaches this point - earlier siblings break out of the
    // cascade with non-empty outer
    const outerPattern = chain.at(-1).pattern;
    if (outerPattern.node?.properties?.length === 0) exprStmt.remove();
    return true;
  }

  // peel single-element ArrayPattern (`[{...}]`) and inner AssignmentPattern (`{...} = {}`)
  // wrappers between an ObjectPattern and its host. shared predicate
  // `isTransparentDestructureWrapper` documents the safety contract under "polyfill always
  // wins". returns `{parent, leftmost}` where:
  //   - `parent`: the next-up parent path past the wrappers (host detection, chain walk)
  //   - `leftmost`: the outermost wrapper node (used for AssignmentExpression LHS match
  //     since `parent.node.left` may be the wrapper rather than the bare pattern)
  function peelTransparentWrappers(pattern) {
    let prev = pattern.node;
    let parent = pattern.parentPath;
    while (parent && isTransparentDestructureWrapper(parent.node, prev)) {
      prev = parent.node;
      parent = parent.parentPath;
    }
    return { parent, leftmost: prev };
  }

  // `const { Array: { from } } = globalThis` -> `const from = _Array$from`.
  // supports N-deep nesting (`const { NS: { Sub: { x } } } = globalThis`): walks up
  // pattern/property pairs until we hit the declarator, then unwinds the cascade from
  // innermost-empty-property-removed outward. AssignmentExpression form is NOT flattened
  // (changing statement shape would lose the expression's return value); only VariableDeclaration.
  // accepts `{ x }`, `{ x: alias }`, `{ x = default }`, `{ x: alias = default }` - user's
  // default is dropped: the polyfill binding is always defined, so `= default` would be
  // dead code; flatten guarantees polyfill wins even on buggy-but-present native
  function tryFlattenNestedProxyDestructure(prop, entry, hintName) {
    const valueNode = propBindingIdentifier(prop.node.value);
    if (!valueNode) return false;
    // collect the chain of (property, pattern) pairs leading up to the host (declarator
    // or ExpressionStatement-wrapped AssignmentExpression). hosts handled here ALWAYS
    // win polyfill - native fallback would produce wrong runtime in usage-pure mode
    // (`from = globalThis.Array.from` picks native on modern engines)
    const chain = [];
    let currentProp = prop;
    for (;;) {
      const pattern = currentProp.parentPath;
      if (!t.isObjectPattern(pattern?.node)) return false;
      chain.push({ prop: currentProp, pattern });
      const { parent, leftmost } = peelTransparentWrappers(pattern);
      if (parent?.isVariableDeclarator()) break;
      // AssignmentExpression in ExpressionStatement context: cascade-rewrite for ALL chain
      // shapes. previously a simple-flatten short-cut full-replaced the statement when no
      // rest sibling was present, but per-prop visitor invocations on multi-prop hosts
      // (`({Array: {from}, Object: {fromEntries}} = globalThis)`) sealed the WHOLE LHS in
      // skippedNodes after the first prop's emit, silently dropping `fromEntries` polyfill.
      // unified cascade walks each prop's chain inner-to-outer independently, dispatching
      // to `_unused` sentinel emission when any rest sibling is present (rest exclusion
      // preserved) or plain remove otherwise; emits `name = _polyfill;` after the host;
      // when the cascade fully empties the outermost pattern, the empty `({} = receiver)`
      // host is removed (last visitor in declaration order does this).
      // `leftmost` matches against AssignmentExpression's LHS - if peel walked past wrappers
      // the LHS may be the outermost wrapper rather than the bare pattern. transparent
      // statement wrappers (ParenthesizedExpression / ChainExpression / TS casts /
      // SequenceExpression with the AE as tail) sitting between AssignmentExpression and
      // ExpressionStatement are flattened in-place: SE prefix exprs land as side-effect
      // ExpressionStatement siblings before the cascade output, the ExpressionStatement's
      // expression slot is replaced with the bare AE so the cascade's bookkeeping (which
      // assumes `assignPath.parentPath === ExpressionStatement`) operates on a clean shape
      if (parent?.isAssignmentExpression() && parent.node.left === leftmost) {
        const peeled = peelToExpressionStatement(parent);
        if (peeled) {
          return cascadeAssignmentExpressionDestructure({
            assignPath: parent, valueNode, prop, chain, entry, hintName, peeled,
          });
        }
      }
      if (!t.isObjectProperty(parent?.node)) return false;
      currentProp = parent;
    }
    // outermost pattern's parent may sit under wrapper layers (`{...} = {}` default,
    // `[{...}]` single-element array) - peel them to reach the host VariableDeclarator
    const { parent: declarator } = peelTransparentWrappers(chain.at(-1).pattern);
    const declaration = declarator.parentPath;
    // for-init with SequenceExpression init - external statement-lift unavailable (the loop
    // header forbids non-declarator statements). split the SE off as a dedicated sink
    // declarator within the same VariableDeclaration so SE evaluation stays observable
    // while polyfill is still extracted as `from = _Array$from` (always wins). non-SE
    // for-init shapes flow through the regular `isForInit` branches below.
    // parser-preserved ParenthesizedExpression wrappers (`createParenthesizedExpressions:
    // true`) can wrap the SE - peel so the shape check still fires under those parser opts
    let forInitRaw = declarator.node.init;
    while (forInitRaw?.type === 'ParenthesizedExpression') forInitRaw = forInitRaw.expression;
    const isForInit = declaration.parentPath?.isForStatement()
      && declaration.parentPath.node.init === declaration.node;
    const isForInitWithSE = isForInit && forInitRaw?.type === 'SequenceExpression';
    const declCount = declaration.node?.declarations?.length ?? 1;
    const id = injectPureImport(entry, hintName);
    // see `tryBodyExtractFromParamDestructure` for rationale on body-extract alias
    injector.registerBodyExtractAlias(valueNode.name, entry, declarator.scope.getBinding(valueNode.name));
    const extractedDeclarator = t.variableDeclarator(t.cloneNode(valueNode), t.cloneNode(id));
    // cascade: each level removes its property when the inner pattern has no siblings.
    // `willRemoveDeclarator` iff EVERY level's pattern had this as its sole property
    const willRemoveDeclarator = chain.every(({ pattern }) => pattern.node.properties.length === 1);
    // seed skippedNodes for the subtree about to be orphaned so scheduled visitor
    // re-entries short-circuit; handleIdentifier's `!path.parent` guard backs this up.
    // NOT calling scope.registerDeclaration on the new binding: attempting it triggered
    // "Duplicate declaration" errors in e2e when the enclosing `scope.crawl()` later
    // re-scanned. skippedNodes + programExit's implicit crawl are sufficient.
    // for-init+SE+willRemoveDeclarator preserves the original init (under a sink id) so
    // its inner Identifier visits (`globalThis` inside `(se(), globalThis)`) still need
    // to fire for substitution; restrict the skip to the pattern (id) in that case
    const skipSubtree = isForInitWithSE && willRemoveDeclarator
      ? declarator.node.id
      : willRemoveDeclarator ? declarator.node : prop.node;
    t.traverseFast(skipSubtree, node => { skippedNodes.add(node); });
    // for-init+SE+willRemoveDeclarator: convert orphan declarator to SE-sink (init keeps
    // the SE expression, id swapped to a fresh identifier) so the SE still evaluates;
    // the polyfill is added as a sibling declarator. avoids both inline-default's buggy-
    // native fallthrough and the SE-loss that plain replacement would cause
    if (isForInitWithSE && willRemoveDeclarator) {
      declarator.node.id = generateUnusedId();
      declarator.insertBefore(extractedDeclarator);
      return true;
    }
    // multi-decl + willRemove + SE prefix: split declaration around the consumed slot so
    // sibling evaluation order survives. earlier `liftSEPrefixSwap` lifted SE before the
    // whole declaration; pre-sibling inits (with inline SEs in their initializers) then
    // ran AFTER the lifted SE - observable when both halves emit effects
    // (`a=(log('A'),'x'), {Array:{from}}=(log('B'),globalThis)`). no-SE multi-decl flows
    // through the legacy `declaration.insertBefore` + splice path below to avoid churning
    // existing fixtures that rely on its shape
    if (trySplitAroundConsumedDeclarator({
      declaration, declarator, extractedDeclarator, willRemoveDeclarator, declCount, isForInit,
    })) return true;
    // declarator-level insert in for-init keeps loop-header shape; declaration-level
    // insert would wrap for-init in an arrow-IIFE and duplicate the bound name inside.
    // for-init can't host external statements either, so SE-prefix lift below is gated
    // on this same predicate
    if (!isForInit) liftSEPrefixSwap(declarator.node, 'init', declaration);
    if (willRemoveDeclarator && declCount === 1) {
      // single-declarator simple-chain: replaceWith preserves leading comments
      declaration.replaceWith(t.variableDeclaration(declaration.node.kind, [extractedDeclarator]));
      return true;
    }
    if (isForInit) declarator.insertBefore(extractedDeclarator);
    else {
      const newDecl = t.variableDeclaration(declaration.node.kind, [extractedDeclarator]);
      // lift leading comments from the host onto the FIRST inserted cascade decl. without
      // this, sibling cascades land split around the original host's comments: first
      // visitor's `insertBefore` keeps comments on the host, then LAST visitor's
      // `replaceWith` (when its level becomes willRemoveDeclarator) inherits them -
      // cosmetically the comments appear BETWEEN cascade emits. idempotent: subsequent
      // inserts find empty leadingComments
      liftLeadingComments(declaration.node, newDecl);
      declaration.insertBefore(newDecl);
    }
    if (willRemoveDeclarator && declCount > 1) {
      // splice out the emptied declarator in-place; `.remove()` mid-traversal nulls
      // path.parent and crashes babel's virtual-type filter on queued inner Identifiers
      const idx = declaration.node.declarations.indexOf(declarator.node);
      if (idx !== -1) declaration.node.declarations.splice(idx, 1);
      return true;
    }
    // partial cascade: remove inner props while their pattern empties out. when ANY rest
    // sibling is present at the level, replace prop value with `_unused` sentinel instead
    // of removing - rest gathers all OTHER own keys, so dropping `Array: {...}` from
    // `{Array: {...}, B: {...}, ...rest} = globalThis` would change runtime semantics
    // (`rest.Array` becomes defined, was excluded). VariableDeclarator host declares the
    // sentinel via the destructure binding itself - no separate `var _unused` needed
    applyRestAwareCascade(chain);
    return true;
  }

  // after extracting a destructured property, if the pattern is now empty
  // (all properties polyfilled, no rest), skip the init node to prevent unused
  // constructor import (e.g., _Promise from { resolve } = Promise)
  function skipEmptyPatternInit(path) {
    const objectPattern = path.parentPath;
    if (objectPattern?.node?.properties?.length > 0) return;
    const parent = objectPattern.parentPath;
    const initNode = parent?.isVariableDeclarator() ? parent.node.init
      : parent?.isAssignmentExpression() ? parent.node.right : null;
    if (initNode) skippedNodes.add(initNode);
  }

  // apply a resolved polyfill to an ObjectProperty path: dispatches to either the
  // function-parameter destructure path (`function({ from }) {}` form) or the regular
  // VariableDeclarator / AssignmentExpression destructure path.
  // `meta` carries `fromFallback` for conditional init (`const { from } = cond ? Array : Set`):
  // rewriting would substitute the polyfill id for the whole receiver, breaking the other
  // branch (`_Set.from` is undefined). pure mode has no side-effect import channel either,
  // so we leave the code intact and warn - runtime correctness depends on which branch
  // fires and on native availability
  function handleObjectPropertyResult({ prop, meta, kind, entry, hintName }) {
    if (meta?.fromFallback) {
      // per-branch synth-swap on ConditionalExpression / LogicalExpression branches: each
      // viable branch becomes its own `{key: _Branch$key}` literal, preserving runtime
      // conditional semantics. receiver lives either on a destructure wrapper slot
      // (`{p} = R`) or as the IIFE call-arg (`(({p}) => body)(R)`) - both shapes are
      // unified by `resolveFallbackReceiverPath`. non-viable branches stay raw and the
      // identifier visitor still rewrites bare globals via the standard path
      const rhsPath = resolveFallbackReceiverPath(prop.parentPath?.parentPath, prop.parentPath?.node);
      const registered = rhsPath && synthSwap.tryRegisterPerBranchSynth(rhsPath, prop);
      if (!registered) {
        getDebugOutput()?.warn(`conditional destructure with polyfill candidate left untouched ("${ meta.key }" on fallback branch) - runtime availability depends on the selected branch`);
      }
      return;
    }
    const objectPattern = prop.parentPath;
    // patternParent walks past transparent destructure wrappers (AssignmentPattern default,
    // single-element ArrayPattern) - both are passthrough for proxy-global resolution
    const { parent: patternParent } = peelTransparentWrappers(objectPattern);
    if (isFunctionParamDestructureParent(objectPattern)) {
      handleParameterDestructure({ prop, kind, entry, hintName });
      return;
    }
    // nested proxy-global destructure: `{ Array: { from } } = globalThis`. default
    // (`from = _Array$from`) wouldn't fire - `globalThis.Array` is always present and
    // `Array.from` is non-undefined on every engine we target (may just be buggy).
    // flatten the outer structure when it's a single-nested shape: replace the whole
    // VariableDeclarator with `const from = _Array$from` so the polyfill ALWAYS wins
    if (patternParent?.isObjectProperty() && kind !== 'instance') {
      if (tryFlattenNestedProxyDestructure(prop, entry, hintName)) return;
      // fallback: non-single shape (outer has siblings) - inline default as last resort
      handleParameterDestructure({ prop, kind, entry, hintName });
      return;
    }
    if (!canTransformDestructuring(prop)) return;
    // export + rest: skip - `_unused` rename would pollute the module's export namespace
    if (objectPattern.node.properties.some(p => p.type === 'RestElement' || p.type === 'SpreadElement')
      && objectPattern.parentPath?.isVariableDeclarator()
      && objectPattern.parentPath.parentPath?.parentPath?.isExportNamedDeclaration()) return;
    let value;
    if (kind === 'instance') {
      const objectNode = resolveDestructuringObject(prop, resolvePropertyObjectType(prop));
      if (!objectNode) return;
      value = t.callExpression(injectPureImport(entry, hintName), [t.cloneNode(objectNode)]);
    } else {
      value = injectPureImport(entry, hintName);
    }
    // proxy-global alias (`{ Symbol: S = default } = globalThis`): AST mutation below
    // rewrites init to `_Symbol === void 0 ? default : _Symbol` - `resolveBindingToGlobal`
    // can't walk that ConditionalExpression, so register S -> 'Symbol' up front
    if (kind === 'global') {
      const localName = patternBindingName(prop.node.value);
      if (localName) injector.registerGlobalAlias(localName, hintName);
    }
    // body-extract alias for static methods: AST mutation rewrites the destructure value
    // to `_unused` (rest sibling) or removes the prop entirely, leaving the new
    // `const <localName> = _Polyfill$Method;` shadow declaration as the only path receiver
    // narrowing can find. injector lookup `getBindingInfo(localName).entry` returns the
    // canonical entry path, so `arr = from('hi'); arr.at(-1)` narrows correctly post-mutation
    if (kind === 'static') {
      const localName = patternBindingName(prop.node.value);
      if (localName) injector.registerBodyExtractAlias(localName, entry, prop.scope.getBinding(localName));
    }
    // mark property as handled - rest-rename triggers re-traversal which must be skipped
    skippedNodes.add(prop.node);
    handleDestructuredProperty(prop, value);
    skipEmptyPatternInit(prop);
  }

  // catch-clause receiver extraction: `catch ({ code }) { ... }` -> `catch (_ref) { let { code } = _ref; ... }`.
  // ArrayPattern destructuring in catch can't be polyfilled by property rewrite (bindings
  // are positional, not named), so extracting it is pure overhead - unplugin keeps it
  // inline and babel mirrors that. ObjectPattern still needs extraction because
  // `{ key = default }` and polyfillable key lookups require a named receiver (`_ref`)
  // to rewrite against. extraction is gated on actual usage: skip when nothing in the
  // catch body reads the destructured names AND no property forces a receiver rewrite
  function extractCatchClause(path) {
    const { param } = path.node;
    if (!param || param.type !== 'ObjectPattern') return;
    if (!param.properties?.length) return;
    // shallow check: only outer-level props are inspected. nested patterns
    // (`{ a: { b: { Array: { from } } } }`) without rest/default/computed at the outer
    // level don't need extraction - the destructure works as-is in catch params, and
    // leaf bindings (`from`) are local catch bindings, not polyfill candidates. recursive
    // descent here would trigger extraction noise without observable runtime gain
    if (!param.properties.some(objectPatternPropNeedsReceiverRewrite)) {
      const destructuredNames = new Set();
      // shallow Identifier-value collection: only outer-level binding identifiers count
      // as polyfill candidates that body-scan can match against. nested-pattern bindings
      // are user's leaf locals, polyfill dispatch doesn't reach them through catch
      for (const p of param.properties) {
        if (p.type !== 'ObjectProperty') continue;
        const name = p.value?.type === 'Identifier' ? p.value.name : null;
        if (name) destructuredNames.add(name);
      }
      // path-based traversal so we can look at `idPath.parent`: `isNonReferencePosition`
      // filters Identifiers in non-reference slots (method/property keys, member-access
      // tails, labels, import/export specifier names) - else `Math.includes` body would
      // false-positive against a `{ includes }` catch binding and force a useless
      // catch-receiver extraction. matches unplugin's same-named filter for shape parity.
      // `isBindingPosition` ALSO filters declaration-id slots (function/class id, declarator
      // id, catch param) - shadow re-declarations like `function from(){}` inside the catch
      // body are bindings, not references; without skip we'd over-extract on every shadow
      let referenced = false;
      path.get('body').traverse({
        Identifier(idPath) {
          if (referenced) return idPath.skip();
          if (!destructuredNames.has(idPath.node.name)) return;
          if (isNonReferencePosition(idPath.parent, idPath.node)) return;
          if (isBindingPosition(idPath.parent, idPath.node)) return;
          referenced = true;
          idPath.stop();
        },
      });
      if (!referenced) return;
    }
    // use our own `_ref, _ref2, ...` generator instead of babel's `scope.generateUidIdentifier`
    // - keeps one naming scheme across the plugin and matches unplugin's output shape
    const ref = injector.generateLocalRef(path.scope);
    path.get('body').unshiftContainer('body', [
      t.variableDeclaration('let', [t.variableDeclarator(param, ref)]),
    ]);
    path.node.param = ref;
  }

  // ---------- per-prop AST emission (strategy-dispatched) ----------

  // resolve the destructure init (VariableDeclarator.init / AssignmentExpression.right) -
  // memoize non-identifier init when other properties remain to avoid double evaluation
  function resolveDestructuringObject(path, typeOfReceiver) {
    const parent = path.parentPath.parentPath;
    const initKey = parent.isVariableDeclarator() ? 'init'
      : parent.isAssignmentExpression() ? 'right' : null;
    if (!initKey) return null;
    const objectNode = parent.node[initKey];
    if (!objectNode) return null;
    if (!t.isIdentifier(objectNode) && path.parentPath.node.properties.length > 1) {
      // declare=false: we emit our own `const _ref = init;` below, no extra `var _ref;`
      const ref = generateLocalRef(path.scope);
      // for-init: splice as sibling declarator; declaration-level insertBefore would wrap
      // the whole for-init in an arrow-IIFE and lose the loop-header shape
      const isForInit = parent.isVariableDeclarator()
        && parent.parentPath?.parentPath?.isForStatement()
        && parent.parentPath.parentPath.node.init === parent.parentPath.node;
      if (isForInit) parent.insertBefore(t.variableDeclarator(ref, objectNode));
      else parent.parentPath.insertBefore(t.variableDeclaration('const', [
        t.variableDeclarator(ref, objectNode),
      ]));
      const cloned = t.cloneNode(ref);
      // store resolved type for subsequent destructured properties to resolve type hints
      if (typeOfReceiver) resolvedType.set(cloned, typeOfReceiver);
      parent.node[initKey] = cloned;
      return ref;
    }
    return objectNode;
  }

  // split multi-declarator VariableDeclaration into separate statements when all patterns resolved
  function trySplitDeclaration(declaration, isExport) {
    if (declaration.node.declarations.some(d => t.isObjectPattern(d.id))) return;
    declaration.replaceWithMultiple(splitDeclarators(declaration.node.declarations, declaration.node.kind, isExport));
  }

  // bodyless control statement with side-effect: wrap in block to keep scope.
  // `cloneDeep` is necessary - the original `initNode` is still referenced by the
  // about-to-be-replaced declaration's path; reusing it would create node-identity aliasing
  // that babel's path tracker mishandles. expensive (deep walk) but bounded by init AST size.
  // deliberately keeps the trailing value of `(se(), Array)` uncut (unlike `deferSideEffect`'s
  // `trimSideEffectTail`) - existing fixtures encode the full sequence as a signal that the
  // block came from a destructure-init extraction.
  // multi-decl host (`var a=1, {p}=SE(), b=2`): sibling declarators preserve their original
  // position around the consumed slot. pre-siblings run before the lifted SE, post-siblings
  // after the extracted target. earlier collapsed-trailing emission silently reordered
  // pre-sibling initializers past the SE expression, observable when both sides carry effects
  function wrapBodylessWithSideEffect({ declaration, initNode, parentDeclarator, extractedDeclaration }) {
    const decls = declaration.node.declarations;
    const idx = decls.indexOf(parentDeclarator);
    const { kind } = declaration.node;
    const stmts = [];
    if (idx > 0) stmts.push(t.variableDeclaration(kind, decls.slice(0, idx)));
    stmts.push(t.expressionStatement(t.cloneDeep(initNode)), extractedDeclaration);
    if (idx < decls.length - 1) stmts.push(t.variableDeclaration(kind, decls.slice(idx + 1)));
    declaration.replaceWith(t.blockStatement(stmts));
  }

  // for-init with SE: keep SE inline so it doesn't escape the loop.
  // static: for (var { from } = (se(), Array);;) -> for (var _ref = (se(), Array), from = _Array$from;;)
  // instance: for (var { at } = getObj();;) -> for (var at = _at(getObj());;) - SE consumed by call.
  // both branches mutate the VariableDeclaration in place; babel's scope tracker doesn't observe
  // raw property/array mutations, so fresh bindings are re-registered on the mutated path
  function handleForInitSE({ declaration, parent, localBinding, value, scope, isStatic }) {
    if (isStatic) {
      // static polyfill import - SE needs a dummy binding to stay in for-init
      const ref = generateLocalRef(scope);
      const idx = declaration.node.declarations.indexOf(parent.node);
      if (idx === -1) return;
      declaration.node.declarations.splice(idx, 1,
        t.variableDeclarator(ref, t.cloneDeep(parent.node.init)),
        t.variableDeclarator(localBinding, value));
      declaration.scope?.registerDeclaration(declaration);
    } else {
      parent.node.id = localBinding;
      parent.node.init = value;
      parent.scope?.registerDeclaration(parent);
    }
  }

  // walk up from `path` to the nearest parent whose container is an array body (statement-level)
  // SwitchCase uses `consequent` instead of `body`
  function findStatementParent(path) {
    let stmt = path;
    while (stmt.parentPath && !Array.isArray(stmt.parentPath.node.body)
      && !Array.isArray(stmt.parentPath.node.consequent)) stmt = stmt.parentPath;
    return stmt;
  }

  // `replaceWith` doesn't register declarations on the target scope, so after collapsing
  // `const { X } = ...` to `const X = ...` a later visit of bare `X` would see an empty
  // scope and mistake `X` for an unbound global. safe only on `replaceWith` (original
  // bindings gone); `insertBefore` keeps the old declaration and duplicate-registering
  // the same name trips babel's block-scope collision check in rest / multi-prop paths
  function replaceWithAndRegister(path, node) {
    const [newPath] = path.replaceWith(node);
    newPath.scope.registerDeclaration(newPath);
  }

  // recursively flatten nested SequenceExpressions: `(x++, (y++, Array))` -> `[x++, y++, Array]`.
  // post-flatten the trailing-tail trim can drop the final no-op (`Array`) instead of leaving
  // a stale read parked under an inner SE wrapper
  function flattenSequence(expressions) {
    const out = [];
    for (const e of expressions) {
      if (t.isSequenceExpression(e)) out.push(...flattenSequence(e.expressions));
      else out.push(e);
    }
    return out;
  }

  // `(inner(), Array)` - when we lift the init as a standalone statement only the
  // side-effectful head is needed; the trailing value (`Array`, read by the destructure)
  // becomes a no-op read once extraction leaves no destructure target. trim it so the
  // emitted ExpressionStatement reads `inner();` instead of `inner(), Array;`. nested SE
  // (`(x++, (y++, Array))`) is flattened first so the inner trailing identifier strips too -
  // pre-fix `flatten` was missing and the outer trim stopped at `(y++, Array)` (which has
  // its own `mayHaveSideEffects` from `y++`), leaving a useless `Array` read in the output
  function trimSideEffectTail(node) {
    if (!t.isSequenceExpression(node)) return node;
    const flat = flattenSequence(node.expressions);
    while (flat.length > 1 && !mayHaveSideEffects(flat.at(-1))) flat.pop();
    if (flat.length === 1) return flat[0];
    const sameShape = flat.length === node.expressions.length
      && flat.every((e, i) => e === node.expressions[i]);
    return sameShape ? node : t.sequenceExpression(flat);
  }

  function deferSideEffect(containerPath, initNode) {
    if (!initNode || !mayHaveSideEffects(initNode)) return;
    const stmt = findStatementParent(containerPath);
    const parentNode = stmt.parentPath?.node;
    const body = parentNode?.body ?? parentNode?.consequent;
    if (Array.isArray(body)) {
      const index = originalDeclKeys.get(containerPath.node) ?? stmt.key;
      // processDeferredSideEffects assumes each queued `node` is an ExpressionStatement
      // (the re-traversal visitor walks only its body and spawns nested polyfills from
      // `.expression`). emit as ExpressionStatement unconditionally; a future caller that
      // wants a different statement type must teach the consumer or wrap on its own
      deferredSideEffects.push({
        body, index,
        seq: deferredSideEffects.length,
        node: t.expressionStatement(t.cloneDeep(trimSideEffectTail(initNode))),
      });
    }
  }

  // babel-plugin's destructure emission counterpart of unplugin's `handleDestructuringPure`.
  // dispatches on the parser-agnostic `planDestructureEmission` strategy enum, then
  // executes the strategy-specific AST mutation. planning logic lives in
  // `./destructure-emission-plan.js` so it stays parser-agnostic and unit-testable;
  // this function owns the babel AST-mutation side
  function handleDestructuredProperty(prop, value) {
    const propValue = prop.node.value,
          // captured before default-value processing turns Identifier into ConditionalExpression
          isStaticValue = t.isIdentifier(value);
    const objectPattern = prop.parentPath;
    // default value: { from = [] } = Array -> from = _from === void 0 ? [] : _from
    // instance calls need temp ref to avoid double evaluation
    let localBinding;
    if (t.isAssignmentPattern(propValue)) {
      localBinding = t.cloneNode(propValue.left);
      const needsTemp = t.isCallExpression(value);
      const ref = needsTemp ? generateRef(prop.scope) : value;
      const test = t.binaryExpression('===', needsTemp ? t.assignmentExpression('=', ref, value) : ref,
        t.unaryExpression('void', t.numericLiteral(0)));
      value = t.conditionalExpression(test, t.cloneNode(propValue.right), t.cloneNode(ref));
    } else {
      localBinding = t.cloneNode(propValue);
    }
    const parent = objectPattern.parentPath;

    // rest element present: keep property in pattern with renamed value to preserve rest semantics
    // const { from, ...rest } = Array -> const from = _from; const { from: _, ...rest } = Array
    const hasRest = objectPattern.node.properties.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
    // rest: rename property value to preserve rest semantics; otherwise remove property
    const isEmpty = hasRest ? false : (prop.remove(), objectPattern.node.properties.length === 0);
    if (hasRest) {
      // shared generator keeps babel and unplugin emitting identical `_unused` sentinels;
      // scope.generateUidIdentifier would diverge when babel's scope tracker sees
      // pre-existing `_unused*` bindings our injector hasn't learnt about
      prop.get('value').replaceWith(generateUnusedId());
      prop.node.shorthand = false;
    }

    if (parent.isVariableDeclarator()) {
      emitVariableDeclaratorDestructure({ prop, parent, localBinding, value, isStaticValue, isEmpty });
    } else {
      emitAssignmentDestructure({ parent, localBinding, value, isStaticValue, isEmpty });
    }
  }

  // build the parser-agnostic context the planner consumes from a babel VariableDeclarator
  // path. delegates host-shape classification (isExport / isForInit / isBodyless /
  // isMultiDecl) to the shared `classifyVariableDeclarationHost` in polyfill-provider so
  // both plugins compute the same booleans from the same source of truth
  function classifyVariableDeclaratorSite({ declaration, parent, isStaticValue, isEmpty }) {
    return {
      parentType: 'VariableDeclarator',
      ...classifyVariableDeclarationHost({
        declaration: declaration.node,
        declarationParent: declaration.parentPath?.node,
      }),
      isEmpty,
      isStaticValue,
      hasSideEffects: isEmpty && mayHaveSideEffects(parent.node.init),
    };
  }

  // VariableDeclarator branch executor. classifies the host shape, asks the planner
  // for a strategy, then dispatches to the matching AST mutation
  function emitVariableDeclaratorDestructure({ prop, parent, localBinding, value, isStaticValue, isEmpty }) {
    const declaration = parent.parentPath;
    // save original index before first insertBefore shifts it
    if (!originalDeclKeys.has(declaration.node)) {
      originalDeclKeys.set(declaration.node, findStatementParent(declaration).key);
    }
    const extractedDeclaration = t.variableDeclaration(declaration.node.kind, [
      t.variableDeclarator(localBinding, value),
    ]);
    const ctx = classifyVariableDeclaratorSite({ declaration, parent, isStaticValue, isEmpty });
    const strategy = planDestructureEmission(ctx);
    switch (strategy) {
      case STRATEGIES.WRAP_BODYLESS_SE:
        return wrapBodylessWithSideEffect({
          declaration,
          initNode: parent.node.init,
          parentDeclarator: parent.node,
          extractedDeclaration,
        });
      case STRATEGIES.FOR_INIT_SE_STATIC:
      case STRATEGIES.FOR_INIT_SE_INSTANCE:
        return handleForInitSE({
          declaration, parent, localBinding, value, scope: prop.scope,
          isStatic: strategy === STRATEGIES.FOR_INIT_SE_STATIC,
        });
      case STRATEGIES.FOR_INIT_MUTATE_DECL:
        parent.node.id = localBinding;
        parent.node.init = value;
        return undefined;
      case STRATEGIES.FOR_INIT_REPLACE:
      case STRATEGIES.REPLACE_DECL:
        return replaceWithAndRegister(declaration, extractedDeclaration);
      case STRATEGIES.DEFER_SE_AND_SPLICE:
        return spliceAndLiftSideEffect({ declaration, parent, localBinding, value });
      case STRATEGIES.DEFER_SE_AND_REPLACE:
        deferSideEffect(declaration, parent.node.init);
        return replaceWithAndRegister(declaration, extractedDeclaration);
      case STRATEGIES.SPLICE_AND_SPLIT:
        return spliceDeclaratorAndSplit({
          declaration, parentNode: parent.node, localBinding, value, isExport: ctx.isExport,
        });
      case STRATEGIES.INSERT_BEFORE_DECLARATOR:
        // `parent.insertBefore` (VariableDeclarator-level) keeps babel-traverse path.key of
        // queued sibling declarators in sync. `declaration.insertBefore` would wrap a
        // for-init in an arrow-IIFE and lose the loop-header shape
        return parent.insertBefore(t.variableDeclarator(localBinding, value));
      case STRATEGIES.INSERT_BEFORE_EXPORT:
        return declaration.parentPath.insertBefore(t.exportNamedDeclaration(extractedDeclaration));
      case STRATEGIES.INSERT_BEFORE_DECLARATION:
        return declaration.insertBefore(extractedDeclaration);
      default:
        throw new Error(`[core-js] destructure-emitter: unhandled destructure strategy ${ strategy }`);
    }
  }

  // splice the now-empty parent declarator out, replace with the extracted (binding = value)
  // declarator, then split mixed export runs into separate statements
  function spliceDeclaratorAndSplit({ declaration, parentNode, localBinding, value, isExport }) {
    const idx = declaration.node.declarations.indexOf(parentNode);
    if (idx !== -1) declaration.node.declarations.splice(idx, 1, t.variableDeclarator(localBinding, value));
    trySplitDeclaration(declaration, isExport);
  }

  // wrap declarators into VariableDeclaration statements. when any declarator still
  // carries an unconsumed ObjectPattern, keep them grouped so later visitor passes see
  // an intact multi-decl; otherwise emit one statement per declarator. shared by
  // `trySplitDeclaration` (whole-declaration split), `spliceAndLiftSideEffect` (pre/post
  // halves around a lifted SE in DEFER_SE_AND_SPLICE), and
  // `splitDeclarationAroundLiftedSE` (nested-proxy SE-prefix lift through a multi-decl)
  function splitDeclarators(decls, kind, isExport) {
    if (!decls.length) return [];
    const groups = decls.some(d => t.isObjectPattern(d.id)) ? [decls] : decls.map(d => [d]);
    return groups.map(g => {
      const decl = t.variableDeclaration(kind, g);
      return isExport ? t.exportNamedDeclaration(decl) : decl;
    });
  }

  // move leading comments from `from` AST node onto `to` (clears them on the source).
  // shared by cascade insert paths and `splitDeclarationAroundLiftedSE` so the relocated
  // first statement inherits the host's leading docblock
  function liftLeadingComments(from, to) {
    const lead = from.leadingComments;
    if (lead?.length) {
      to.leadingComments = lead;
      from.leadingComments = null;
    }
  }

  // nested-proxy cascade split gate: fires on multi-decl + willRemove + non-for-init.
  // peels the consumed declarator's SE prefix (empty array when no SE) and delegates
  // to the shared `splitDeclarationAtSlot`. for-init / single-decl take legacy paths
  // (loop-header shape / no siblings to reorder)
  function trySplitAroundConsumedDeclarator({
    declaration, declarator, extractedDeclarator, willRemoveDeclarator, declCount, isForInit,
  }) {
    if (!willRemoveDeclarator || declCount <= 1 || isForInit) return false;
    const idx = declaration.node.declarations.indexOf(declarator.node);
    if (idx === -1) return false;
    const { prefix } = peelNestedSequenceExpressions(declarator.node.init);
    splitDeclarationAtSlot({ declaration, idx, sePrefix: prefix, extractedDeclarator });
    return true;
  }

  // shared primitive: replace declaration with `[pre-siblings, ...SE expression
  // statements, extracted + post-siblings]`. `sePrefix` is an array of AST expression
  // nodes (empty for no-SE callers) - each cloned into a standalone ExpressionStatement
  // between the pre and post halves so sibling evaluation order survives. consumers:
  //   - `trySplitAroundConsumedDeclarator` (nested-proxy cascade, pre-peeled SE prefix)
  //   - `spliceAndLiftSideEffect` (DEFER_SE_AND_SPLICE, single-element SE array or empty)
  function splitDeclarationAtSlot({ declaration, idx, sePrefix, extractedDeclarator }) {
    const { kind } = declaration.node;
    const isExport = declaration.parentPath?.isExportNamedDeclaration();
    const decls = declaration.node.declarations;
    const stmts = [
      ...splitDeclarators(decls.slice(0, idx), kind, isExport),
      ...sePrefix.map(e => t.expressionStatement(t.cloneNode(e))),
      ...splitDeclarators([extractedDeclarator, ...decls.slice(idx + 1)], kind, isExport),
    ];
    if (stmts.length) liftLeadingComments(declaration.node, stmts[0]);
    declaration.replaceWithMultiple(stmts);
  }

  // DEFER_SE_AND_SPLICE strategy executor: lift the side-effecting init out of the
  // consumed slot and split declaration around it. SE init -> single trimmed expression
  // emitted between pre/post halves; no-SE init -> empty SE prefix (split still
  // preserves sibling order). earlier `deferSideEffect` anchored SE at original-
  // declaration body index, so after `trySplitDeclaration` shifted siblings, the lifted
  // SE landed BEFORE pre-siblings (observable when both halves carry effects)
  function spliceAndLiftSideEffect({ declaration, parent, localBinding, value }) {
    const idx = declaration.node.declarations.indexOf(parent.node);
    if (idx === -1) return;
    const sePrefix = mayHaveSideEffects(parent.node.init)
      ? [trimSideEffectTail(parent.node.init)]
      : [];
    splitDeclarationAtSlot({
      declaration, idx, sePrefix,
      extractedDeclarator: t.variableDeclarator(localBinding, value),
    });
  }

  // AssignmentExpression branch executor. far simpler than the VariableDeclarator path:
  // either replace the host ExpressionStatement with the new assignment, or insert before
  function emitAssignmentDestructure({ parent, localBinding, value, isStaticValue, isEmpty }) {
    const assignment = t.expressionStatement(t.assignmentExpression('=', localBinding, value));
    const assignmentTarget = parent.parentPath;
    const hasSideEffects = isEmpty && mayHaveSideEffects(parent.node.right);
    const strategy = planDestructureEmission({
      parentType: 'AssignmentExpression',
      isEmpty, isStaticValue, hasSideEffects,
    });
    switch (strategy) {
      case STRATEGIES.DEFER_SE_AND_REPLACE_ASSIGN:
        deferSideEffect(assignmentTarget, parent.node.right);
        return assignmentTarget.replaceWith(assignment);
      case STRATEGIES.REPLACE_ASSIGNMENT:
        return assignmentTarget.replaceWith(assignment);
      case STRATEGIES.INSERT_BEFORE_ASSIGNMENT:
        return assignmentTarget.insertBefore(assignment);
      default:
        throw new Error(`[core-js] destructure-emitter: unhandled destructure strategy ${ strategy }`);
    }
  }

  return { deferredSideEffects, extractCatchClause, handleObjectPropertyResult };
}
