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
  paramsHaveInvisibleCallers,
  findArrayWrappedDestructureHost,
  hasRestSiblingExcept,
  isBindingPosition,
  isFunctionParamDestructureParent,
  isIdentifierPropValue,
  isNonReferencePosition,
  isSynthSimpleObjectPattern,
  isTransparentDestructureWrapper,
  synthSwapPropKey,
  mayHaveSideEffects,
  dropDeadSequenceTail,
  isRestProperty,
  peelNestedSequenceExpressions,
  peelParenAndTSParentPath,
  peelToExpressionStatement,
  propBindingIdentifier,
  resolveFallbackReceiverPath,
  sequenceKeyPrefix,
  sequenceKeyStaticName,
  TRANSPARENT_EXPR_WRAPPER_TYPES,
  unwrapRuntimeExpr,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  classifyCallBranchForSynth,
  applyNestedParamSynthPlan,
  renderSynthTree,
  buildNestedParamSynthPlan,
  canTransformDestructuring as sharedCanTransformDestructuring,
  isReReferenceableReceiver,
  nestedAssignmentStatementOf,
  planSideEffectKeyStrategy,
  qualifiesForParamBodyExtract,
  resolveNestedReceiverNode,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import { buildNestedDestructurePlan } from '@core-js/polyfill-provider/detect-usage/destructure-plan';
import { maximalProxyGlobalHop, patternBindingName } from '@core-js/polyfill-provider/detect-usage/resolve';
import { globalProxyMemberName, peelProxyGlobalObject } from '@core-js/polyfill-provider/helpers/class-walk';
import { classifyVariableDeclarationHost, isBodylessStatementSlot } from '@core-js/polyfill-provider/destructure-host-shape';
import {
  planDestructureEmission,
  STRATEGIES,
} from './destructure-emission-plan.js';
import { patternComputedKeysSynthSafe } from './synth-key-utils.js';

// when a residual destructure keeps a proxy-global member-chain receiver in the output (a
// surviving sibling / ...rest still reads off it, or it stays as a param default), collapse
// the intermediate proxy hops to the polyfilled root so `globalThis.self.Array` emits
// `_globalThis.Array`, not the runtime-undefined `_globalThis.self.Array` (ie:11 / Node).
// gated on `maximalProxyGlobalHop` so only a real intermediate hop is collapsed - the bare-root
// `globalThis.Array` keeps its natural global-rewrite path. the actual AST rewrite is the shared
// `collapseProxyGlobalReceiver` (the same helper the synth-swap path uses via `buildSynthLiteral`)
function collapseRetainedProxyReceiver(synthSwap, hostNode, key, aliasCtx = null) {
  if (!hostNode) return;
  // peel SE-tail + Paren/TS wrappers to the inner member chain, tracking the slot it lives in so
  // the collapsed receiver writes back UNDER the wrapper - the `(se(), ...)` prefix and the `as`
  // cast must survive. without the peel, `maximalProxyGlobalHop` (it inspects MemberExpression
  // chains only) returns null on an SE/TS-wrapped multi-hop receiver and the collapse is skipped,
  // emitting `_globalThis.self.Array` whose `_globalThis.self` is runtime-undefined (ie:11 / Node)
  let slotParent = hostNode;
  let slotKey = key;
  for (;;) {
    const node = slotParent[slotKey];
    if (node?.type === 'SequenceExpression' && node.expressions.length) {
      slotParent = node.expressions;
      slotKey = node.expressions.length - 1;
    } else if (node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type)) {
      slotParent = node;
      slotKey = 'expression';
    } else break;
  }
  const receiver = slotParent[slotKey];
  // a retained LOGICAL receiver (`globalThis.self.Array || Set`) keeps its operands live; collapse
  // the proxy hop in EACH so an evaluated operand never reads `_globalThis.self` (undefined on
  // ie:11 / Node, which throws BEFORE the `||` short-circuit can save it). recursion also covers
  // nested logicals and SE/wrapper-wrapped operands via the same slot peel. NODE-ONLY (null aliasCtx)
  // - matches the unplugin `polyfillLogicalInitOperands` per-operand collapse, which is node-only;
  // a const-alias proxy root inside a logical operand stays uncollapsed in BOTH plugins (a both-side
  // gap, not a divergence). alias-awareness here would diverge from / crash against the natural
  // visitor's whole-ctor rewrite of an alias pure-ctor operand
  if (receiver?.type === 'LogicalExpression') {
    collapseRetainedProxyReceiver(synthSwap, receiver, 'left', aliasCtx);
    collapseRetainedProxyReceiver(synthSwap, receiver, 'right', aliasCtx);
    return;
  }
  if (!receiver || !maximalProxyGlobalHop(receiver, aliasCtx)) return;
  const collapsed = synthSwap.collapseProxyGlobalReceiver(receiver, aliasCtx);
  if (collapsed) slotParent[slotKey] = collapsed;
}

// descend a transparent single-element array wrapper (`[{...}] = [(se(), R)]`) to the element
// that carries the receiver's SE prefix - one ArrayExpression level down where the bare
// top-level peel (which only sees a top-level SequenceExpression) would miss it. mirrors the
// unplugin `peelArrayWrapperPair` init descent. returns `{ prefix, tail, arr }` (arr = the
// innermost ArrayExpression whose first element holds the SE) or null when there is no wrapper
// or no nested SE. takes `t` since it sits at module scope, outside the factory closure
function descendArrayWrapperToSE(t, declaratorNode) {
  let pattern = declaratorNode.id;
  let arr = declaratorNode.init;
  while (t.isArrayPattern(pattern) && pattern.elements.length === 1 && pattern.elements[0]
    && t.isArrayExpression(arr) && arr.elements.length === 1 && arr.elements[0]) {
    const [patternElement] = pattern.elements;
    const [arrElement] = arr.elements;
    const { prefix, tail } = peelNestedSequenceExpressions(arrElement);
    if (prefix.length) return { prefix, tail, arr };
    pattern = t.isAssignmentPattern(patternElement) ? patternElement.left : patternElement;
    arr = arrElement;
  }
  return null;
}

// build per-SE-expr ExpressionStatements (one per peeled prefix expr) for `insertBefore`.
// matches unplugin's `cascadeAssignmentExpression` which emits each SE as a standalone
// `se();` segment - multi-SE chains land as `se1(); se2(); ...` in both pipelines.
// cloning preserves sibling visitors' path references through AST sub-tree relocation
function buildSEPrefixStatements(t, prefix) {
  return prefix.map(e => t.expressionStatement(t.cloneNode(e)));
}

// the node that HOSTS this destructure prop, found by walking only the destructure's own pattern chain
// (ObjectPattern / ArrayPattern / Property / AssignmentPattern wrappers) - a VariableDeclarator, an
// AssignmentExpression, or a function param. NOT `findParent(...)`, which crosses function / assignment
// boundaries and would wrongly latch onto an OUTER host (e.g. `const r = (() => { ({m} = x) })()`)
function destructurePatternHost(prop) {
  let path = prop.parentPath;
  while (path && (path.isObjectPattern() || path.isArrayPattern()
    || path.isObjectProperty() || path.isAssignmentPattern() || path.isRestElement())) {
    path = path.parentPath;
  }
  return path;
}

// the VariableDeclaration that hosts this prop, or null when the host is an assignment target
// (`({ y: { m } } = R)`) or a param - there is no declaration to extract a `const` into
function hostDeclarationOf(prop) {
  const host = destructurePatternHost(prop);
  return host?.isVariableDeclarator() ? host.parentPath : null;
}

// generic SE-prefix lift: peels prefix from `node[key]`, emits ExpressionStatements before
// `hostPath`, and collapses the slot to the bare tail. used for the AssignmentExpression
// (`right`) host and - via `liftDeclaratorInitSE` - the VariableDeclarator (`init`) host.
// mutating the slot is essential: multiple polyfilled props sharing one SE-bearing receiver
// each visit independently; without the swap, every visit re-peels the prefix, duplicating `se();`
function liftSEPrefixSwap(t, node, key, hostPath) {
  const { prefix, tail } = peelNestedSequenceExpressions(node[key]);
  if (!prefix.length) return;
  hostPath.insertBefore(buildSEPrefixStatements(t, prefix));
  node[key] = tail;
}

// declarator-`init` SE lift that ALSO descends a transparent array wrapper hiding the receiver
// SE one ArrayExpression level down (`[{...}] = [(se(), R)]`), where the top-level peel can't
// see it. the wrapper is discarded by the flatten, so lift the nested-element SE and swap the
// element to its bare tail (stops a multi-prop host re-visit from re-lifting). no wrapper ->
// the plain top-level `liftSEPrefixSwap`
function liftDeclaratorInitSE(t, declaratorNode, hostPath) {
  const descended = descendArrayWrapperToSE(t, declaratorNode);
  if (!descended) return liftSEPrefixSwap(t, declaratorNode, 'init', hostPath);
  hostPath.insertBefore(buildSEPrefixStatements(t, descended.prefix));
  descended.arr.elements[0] = descended.tail;
}

// render the provider-normalized nested-param synth plan as AST replacing the parameter
// DEFAULT (the semantics - tree mirror, validation, leaf resolution - live in the shared
// `buildNestedParamSynthPlan`; this is a dumb renderer, unplugin renders the same plan as text)
function renderNestedParamSynth({ prop, meta, deps }) {
  const { t, resolvePure, injectPureImport, skippedNodes } = deps;
  const plan = buildNestedParamSynthPlan({ leafPatternPath: prop.parentPath, meta, resolvePure });
  return applyNestedParamSynthPlan({
    plan,
    renderTree: tree => renderSynthTree(tree, {
      polyfill: injectPureImport,
      array: element => t.arrayExpression([element]),
      object: entries => t.objectExpression(entries.map(
        ({ key, value }) => t.objectProperty(t.identifier(key), value))),
    }),
    // the target may sit in EITHER subtree (`(m && globalThis) || self` unfolds BOTH sides) -
    // descend from the host slot by span containment to recover the live path
    // generic span-containment descent: at every level pick the child slot whose span holds
    // the target (covers logical / conditional / sequence / paren AND transparent-IIFE hops -
    // call callee, arrow body, block return). the printer re-parenthesizes as needed, so the
    // plan's needsParens marker is text-emitter-only
    replaceTarget(targetNode, rendered) {
      let target = plan.host.get(plan.slot);
      for (let guard = 0; target.node !== targetNode && guard < 32; guard++) {
        let next = null;
        for (const key of t.VISITOR_KEYS[target.node.type] ?? []) {
          const child = target.node[key];
          if (Array.isArray(child)) {
            const index = child.findIndex(item => item && targetNode.start >= item.start && targetNode.end <= item.end);
            if (index !== -1) next = target.get(`${ key }.${ index }`);
          } else if (child && typeof child.start === 'number'
            && targetNode.start >= child.start && targetNode.end <= child.end) {
            next = target.get(key);
          }
          if (next) break;
        }
        if (!next) return false;
        target = next;
      }
      if (target.node !== targetNode) return false;
      target.replaceWith(rendered);
      return true;
    },
    skipSubtree: targetNode => t.traverseFast(targetNode, node => { skippedNodes.add(node); }),
  });
}

// the AssignmentExpression hosting this destructure prop (`({ x } = Source)`), walking the
// pattern/property spine only; null for declarator-hosted destructures
function enclosingDestructureAssignment(prop) {
  for (let p = prop.parentPath; p; p = p.parentPath) {
    if (p.isAssignmentExpression()) return p.node;
    if (!p.isObjectPattern() && !p.isObjectProperty() && !p.isArrayPattern()
      && !p.isParenthesizedExpression()) return null;
  }
  return null;
}

// destructure-emit factory: orchestrates the flatten / cascade / param / catch pipelines,
// each with dedicated closure state (`skippedNodes` / `synthSwap` / bookkeeping WeakMaps).
// extracting sub-factories would split those shared accumulators across module boundaries,
// which is what the single-factory shape avoids (mirrors the unplugin twin)
/* eslint-disable-next-line max-statements -- factory orchestrator, see comment above */
export default function createDestructureEmitter({
  t,
  adapter,
  generateRef,
  paramDefaultNeverOverridden = null,
  resolvePure,
  generateLocalRef,
  generateUnusedId,
  injector,
  injectPureImport,
  isDisabled,
  resolvePropertyObjectType,
  resolvedType,
  skippedNodes,
  synthSwap,
  getDebugOutput,
}) {
  // alias-resolution context for the proxy-global collapse: lets `findProxyGlobal` follow a
  // const-alias root (`const g = globalThis; g.self.X`) through the canonical resolver, so the
  // `.self` hop collapses off an aliased global too (it would otherwise read undefined on ie:11 /
  // Node). null -> node-only collapse (root classified by name)
  function aliasCtxFromPath(path) {
    return path?.scope ? { scope: path.scope, adapter, path } : null;
  }
  // original body index of each declaration, before insertBefore shifts it
  const originalDeclKeys = new WeakMap();
  // flat-family multi-declarator declarations touched by per-prop emission: split into one
  // statement per declarator AFTER the traversal completes (the unplugin canon - its
  // byStatement render emits per-slot statements; splitting mid-traversal would orphan
  // queued sibling-prop visits). a TRAILING sibling declarator (the SE-key / multi-instance
  // TDZ-safe shape: the polyfill references the receiver bound by its predecessor) stays in
  // the SAME statement as that predecessor - the drain groups it instead of splitting
  const flatTouchedMultiDecls = new Set();
  const attachToPrevDeclarator = new WeakSet();
  // receiver-memo declarators planted at their source slot: the post-traverse split renders
  // them as standalone `const` statements WITHOUT an export wrap (the memo is an internal
  // temp, and `const` regardless of host kind - the canon both emitters emit)
  const memoDeclarators = new WeakSet();
  // for-init extraction declarators inserted ahead of their host: the SE sink must land
  // BEFORE all of them (the receiver SE evaluates ahead of the extracted bindings - the
  // source-faithful order the unplugin render emits)
  const forInitExtractionDecls = new WeakSet();

  // `let { pattern } = _ref;` declarations synthesized by `extractCatchClause`: their
  // default-guard test refs fold into the SAME `let` (`let _ref2, it = ...`) instead of a
  // hoisted `var _ref2;` - the catch-canon shape both emitters emit
  const catchBornDeclarations = new WeakSet();
  // per-function (body-extract) and per-host (AssignmentExpression cascade) emission bookkeeping:
  // each chains `insertAfter` on the previous inserted node to preserve source order (a bare
  // anchor.insertAfter every visit stacks subsequent inserts in REVERSE) and shares one
  // `var _unused, _unused2;`. matches unplugin's single-pass shape for byte-identical ordering
  const bodyExtractLastInsert = new WeakMap(),
        assignHostBookkeeping = new WeakMap();
  // per-statement nested-instance overwrite tail: chains each overwrite off the previous one so a
  // multi-element pattern emits them in SOURCE order (last element wins, as native destructuring)
  const nestedOverwriteLastInsert = new WeakMap();
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
    })) return false;
    if (parent?.isAssignmentExpression()) {
      // walk past Paren / TS wrappers between Assignment and its ExpressionStatement host.
      // without TS peel `({from} = Array) as any;` parses as ExprStmt > TSAsExpression >
      // Assignment and the rewrite silently bails; mirror of unplugin's emit-utils peel
      const host = peelParenAndTSParentPath(parent);
      if (host?.node?.type !== 'ExpressionStatement') return false;
    }
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

  // anchor a body-extract decl inside `fnPath.body`. first call lands after the directive
  // prologue (or at body[0] when no directives); subsequent calls chain off the previous
  // insert so multi-polyfilled-param functions emit declarations in SOURCE order rather
  // than the REVERSE order a naive directive-anchor reuse would produce. returns the
  // inserted path so callers can chain the next insertion off it
  function insertBodyExtractDecl(fnPath, newDecl) {
    const prevInsert = bodyExtractLastInsert.get(fnPath.node);
    if (prevInsert) return prevInsert.insertAfter(newDecl)[0];
    const bodyPath = fnPath.get('body');
    const directiveCount = countLeadingDirectives(bodyPath.node.body);
    if (directiveCount === 0) return bodyPath.unshiftContainer('body', newDecl)[0];
    return bodyPath.get('body')[directiveCount - 1].insertAfter(newDecl)[0];
  }

  // parameter destructure polyfill. only static/global fit here; instance methods need a
  // receiver. synth-swap when `synthSwap.findTargetPath` identifies a safe Identifier
  // receiver; otherwise inline-default `{p = _polyfill}` (fires only on undefined property).
  // bare param without IIFE / receiver `function({ from }) {}` bails by design - `from`
  // could be ANY value the caller passes, not necessarily Array.from.
  // AssignmentPattern (`{from = []} = Array`): accept both `{key: binding}` and
  // `{key = default}` shapes. the user's default becomes dead code under synth-swap
  // (polyfill id is always defined) but stays syntactically intact in the output
  function handleParameterDestructure({ prop, kind, entry, hintName, meta = null }) {
    if (kind === 'instance') return;
    if (!isIdentifierPropValue(prop.node.value)) return;
    const objectPattern = prop.parentPath;
    // synth-swap fits any Identifier key - plain `{ of }` or a bare-Identifier computed key
    // `{ [k]: of }` (mirrored as `{ [k]: _polyfill }`). `isSynthSimpleObjectPattern` gates the
    // whole pattern: it rejects a string / numeric / side-effecting key and a computed key that
    // reads a SIBLING binding (`{ of, [of]: x }`). non-Identifier keys still fall through to the
    // body-extract / inline-default fallback, which binds via `prop.node.value` keeping key text intact
    const synthKey = t.isIdentifier(prop.node.key)
      || (prop.node.computed && sequenceKeyStaticName(prop.node.key) !== null);
    const targetPath = synthKey && isSynthSimpleObjectPattern(objectPattern.node, { allowSideEffectComputedKeys: true })
      && patternComputedKeysSynthSafe(t, objectPattern.node, prop.scope)
      ? synthSwap.findTargetPath(objectPattern?.parentPath, objectPattern) : null;
    if (!targetPath) {
      // a NESTED / array-wrapped parameter default replaces the DEFAULT itself with a
      // synthesized literal - fully caller-correct (see buildNestedParamSynthPlan)
      if (renderNestedParamSynth({ prop, meta, deps: { t, resolvePure, injectPureImport, skippedNodes } })) return;
      // synth-swap bailed (computed key / non-Identifier shape sibling) - try body-extract
      // first: insert `const from = _polyfill;` at function body top + remove the prop
      // from the destructure. preserves "polyfill always wins" even at the cost of caller-
      // passed `{from: customFrom}` being ignored (consistent with VariableDeclaration
      // flatten contract). expr-body arrows skipped (no statement slot to host the const)
      //
      // the receiver stays as the param DEFAULT (`{...} = R`, evaluated when the arg is
      // undefined), so collapse a proxy-global member chain in it before either fallback runs
      const paramDefault = objectPattern.parentPath;
      if (paramDefault?.isAssignmentPattern()) {
        collapseRetainedProxyReceiver(synthSwap, paramDefault.node, 'right', aliasCtxFromPath(paramDefault));
      }
      // caller-lossy emissions (body-extract ignores a caller-passed value; a leaf inline
      // default polyfills an ABSENT caller leaf that native leaves undefined) are sound only
      // when no invisible caller exists: an assignment-form host (fixed receiver) or an
      // immediately invoked function (every call site visible). a declared / exported
      // function's params stay VERBATIM instead - usage-global injection covers the targets
      if (paramsHaveInvisibleCallers(prop, { paramNeverOverridden: paramDefaultNeverOverridden })) return;
      // a side-effecting computed key (`{ [(eff(), 'from')]: from }`) must NOT body-extract: that
      // removes the key text (dropping the prefix effects). the inline default keeps the key in the
      // pattern (run once) and appends `= _Array$from`, the SE-preserving shape on every host
      const keyHasSideEffect = prop.node.computed && sequenceKeyPrefix(prop.node.key);
      if (!keyHasSideEffect && tryBodyExtractFromParamDestructure(prop, entry, hintName)) return;
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
    // mutates targetPath before then, the swap is skipped and no dead import is left.
    // the shared classifier flags SE-bearing receivers (call branches AND buried-SE member
    // spines) for the rescue emission - the literal alone would drop the effect
    const sePolicy = classifyCallBranchForSynth({
      inner: targetPath.node, scope: targetPath.scope, adapter, path: targetPath,
    });
    synthSwap.registerPolyfill({
      targetPath, objectPatternPath: objectPattern, key: synthSwapPropKey(prop.node), entry, hintName,
      callBranch: sePolicy.callBranch, rescueSe: sePolicy.rescueSe,
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
    // the qualification chain (caller-lossiness containment / foreign-binding redeclare /
    // block body / param-scope reads / var-redeclare) lives in the shared provider gate so
    // both emitters bail on exactly the same shapes
    const qualified = qualifiesForParamBodyExtract({ propPath: prop, localId: valueNode });
    if (!qualified) return false;
    const { fnPath } = qualified;
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
    bodyExtractLastInsert.set(fnPath.node, insertBodyExtractDecl(fnPath, newDecl));
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

  // force-wrap a bodyless-slot ExpressionStatement (`if (cond) STMT;` / `while (cond) STMT;`
  // / etc.) in a BlockStatement and return the in-block path. babel's `path.insertAfter` on
  // such a slot internally wraps the slot but DOES NOT update the original path's listKey/
  // key; subsequent `path.remove()` then targets the stale slot key and silently removes
  // the whole synthetic block. wrap via `path.replaceWith(BlockStatement)` so babel updates
  // the slot's path state, then re-resolve to the inner body[0] path. a direct
  // `parent.node[key] = ...` AST write would break that path state - replaceWith keeps the path
  // API contract intact while still wrapping the slot atomically
  function ensureExprStmtInBlock(exprStmt) {
    const parent = exprStmt.parentPath;
    if (!isBodylessStatementSlot(parent?.node, exprStmt.node)) return exprStmt;
    const innerNode = exprStmt.node;
    exprStmt.replaceWith(t.blockStatement([innerNode]));
    return exprStmt.get('body.0');
  }

  // strip transparent wrappers (oxc parens / TS casts / chain / SE-with-AE-as-tail) sitting
  // between the AssignmentExpression and its ExpressionStatement host. SE prefix expressions
  // land as side-effect ExpressionStatement siblings before the host; the host's expression
  // slot collapses to the bare AE so the cascade's bookkeeping (which assumes
  // assignPath.parentPath === ExpressionStatement) operates on a clean shape. flatten only
  // on FIRST visit per host - sibling per-prop re-entries find the slot already collapsed.
  // path-API replaceWith (NOT raw `exprStmt.node.expression = ...`) updates babel's parent
  // chain for inner descendants; raw mutation leaves the detached SE expression slot
  // referenced by inner prop paths, and `isOrphaned` flags every sibling after the first
  // as orphaned - silently dropping per-prop polyfill dispatch for multi-prop hosts
  function flattenSEWrappersToBareAE(exprStmt, assignPath, peeled) {
    if (!peeled || exprStmt.node.expression === assignPath.node) return;
    const prefixStmts = peeled.sequencePrefix.map(e => t.expressionStatement(e));
    exprStmt.get('expression').replaceWith(assignPath.node);
    if (prefixStmts.length) exprStmt.insertBefore(prefixStmts);
  }

  // `({Array: {from}, ...} = receiver);` (AssignmentExpression in ExpressionStatement) -
  // plan-driven batch rewrite on the first dispatched leaf, mirroring
  // `renderDeclaratorFlattenPlan`: the plan host is a synthetic `{ id, init }` over the
  // assignment's slots, `keepsTail` because the statement keeps its receiver tail verbatim.
  // pattern pruned in place (`_unused` sentinels under rest preserve exclusion; a shared
  // `var _unused, _unused2;` is hoisted before the host - LHS slots must be pre-declared,
  // strict mode otherwise throws); each extraction lands as `name = _polyfill;` after the
  // host in plan order. when the pattern fully empties, the dead `({} = receiver)` host is
  // removed - an SE-bearing receiver that survived the prefix lift (an SE nested inside an
  // ArrayExpression element is not hoistable as a top-level prefix) keeps evaluating as a
  // bare statement. preserves "polyfill always wins" - the destructure discards the
  // receiver's native value into `_unused`, then `name = _polyfill` overrides it
  const cascadedAssignments = new WeakSet();
  function cascadeAssignmentExpressionDestructure({ assignPath, prop, peeled = null }) {
    const rawStmt = peeled?.exprStmt ?? assignPath.parentPath;
    if (cascadedAssignments.has(assignPath.node)) return !!prop && skippedNodes.has(prop.node);
    // loc rides along so the plan's anchor disable-gate sees the real statement line
    const fake = { id: assignPath.node.left, init: assignPath.node.right, loc: assignPath.node.loc };
    const plan = buildFlattenPlan({
      declaratorNode: fake, scope: assignPath.scope, path: assignPath, keepsTail: true,
    });
    if (!plan) return false;
    // the kept receiver tail carries its own setup (a chain assignment / SE-bearing call) -
    // neutralize the harvest so an extraction prefix doesn't re-run it (mirrors unplugin)
    plan.discardSe = null;
    cascadedAssignments.add(assignPath.node);
    const assigns = [];
    for (const outer of plan.outerProps) {
      for (const e of outer.extractions ?? []) {
        let value;
        if (e.synth === 'symbol-iterator') {
          value = t.callExpression(t.cloneNode(injectPureImport('get-iterator-method', 'getIteratorMethod')),
            [flattenSynthReceiver(assignPath.node.right, plan)]);
        } else {
          // see `renderDeclaratorFlattenPlan` for the global-vs-static alias split; the
          // assignment node marks the destructure's own write as the aliasing event
          if (e.kind === 'global') injector.registerGlobalAlias(e.localName, e.hint);
          else injector.registerBodyExtractAlias(e.localName, e.entry, assignPath.scope.getBinding(e.localName), assignPath.node);
          value = injectPureImport(e.entry, e.hint);
        }
        assigns.push(buildPolyfillAssignmentStatement(t.identifier(e.localName), value));
      }
    }
    // a render reducing to exactly ONE statement on an unbraced control slot keeps the
    // slot bodyless - block-wrapping a single statement would churn the guard shape for
    // nothing. two single-statement shapes exist: a FULL consume with one assignment
    // (`if (cond) from = _Array$from;` - host removed, the assign is the emission) and a
    // ZERO-extraction anchored residual (`if (cond) ({ custom } = _Map);` - the rewritten
    // host is the emission). both require no SE prefixes / rest sentinels around them
    const fullyConsumed = plan.outerProps.every(o => o.kind === 'consumed')
      && !plan.pattern.properties.some(isRestProperty);
    const seFree = !peeled?.sequencePrefix?.length
      && !peelNestedSequenceExpressions(assignPath.node.right).prefix.length
      && !mayHaveSideEffects(assignPath.node.right);
    // zero extractions imply zero consumed props, so the prune emits no rest sentinels -
    // a rest element is harmless in the anchored single-statement shape
    const singleStatement = seFree
      && (fullyConsumed && assigns.length === 1 || (!assigns.length && plan.anchor));
    if (singleStatement && isBodylessStatementSlot(rawStmt.parentPath?.node, rawStmt.node)) {
      prunePatternByPlan(plan.pattern, plan.outerProps);
      if (assigns.length) rawStmt.get('expression').replaceWith(assigns[0].expression);
      else applyAnchoredAssignmentRebuild(plan, assignPath);
      return !!prop && skippedNodes.has(prop.node);
    }
    const exprStmt = ensureExprStmtInBlock(rawStmt);
    flattenSEWrappersToBareAE(exprStmt, assignPath, peeled);
    liftSEPrefixSwap(t, assignPath.node, 'right', exprStmt);
    const bk = getAssignHostBookkeeping(assignPath.node);
    appendUnusedVarDeclarators(bk, exprStmt, prunePatternByPlan(plan.pattern, plan.outerProps));
    for (const stmt of assigns) appendPolyfillAssignment(bk, exprStmt, stmt);
    // ANCHORED residual on an assignment host: `({ K: <inner> } = proxy)` becomes
    // `(<inner'> = <ctorBinding>)` - same rebuild as the declarator render
    if (plan.anchor && plan.pattern.properties.length > 0) {
      applyAnchoredAssignmentRebuild(plan, assignPath);
    }
    if (plan.pattern.properties.length === 0) {
      if (mayHaveSideEffects(assignPath.node.right)) exprStmt.get('expression').replaceWith(assignPath.node.right);
      else exprStmt.remove();
    }
    return !!prop && skippedNodes.has(prop.node);
  }

  // anchored residual rebuild for an assignment host: swap the LHS to the (pruned) inner
  // pattern and the RHS to the ctor binding / raw member; the detached proxy read is
  // skip-seeded so it doesn't earn a dead import
  function applyAnchoredAssignmentRebuild(plan, assignPath) {
    const oldRight = assignPath.node.right;
    assignPath.node.left = plan.pattern;
    assignPath.node.right = anchorInitNode(plan);
    t.traverseFast(oldRight, node => { skippedNodes.add(node); });
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
  function tryFlattenNestedProxyDestructure(prop) {
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
      // shapes. a simple-flatten short-cut full-replacing the statement when no rest sibling
      // is present would, on multi-prop hosts
      // (`({Array: {from}, Object: {fromEntries}} = globalThis)`), seal the WHOLE LHS in
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
          return cascadeAssignmentExpressionDestructure({ assignPath: parent, prop, peeled });
        }
      }
      if (!t.isObjectProperty(parent?.node)) return false;
      currentProp = parent;
    }
    // outermost pattern's parent may sit under wrapper layers (`{...} = {}` default,
    // `[{...}]` single-element array) - peel them to reach the host VariableDeclarator
    const { parent: declarator } = peelTransparentWrappers(chain.at(-1).pattern);
    return renderDeclaratorFlattenPlan(declarator, prop);
  }

  // declarator nodes already batch-rendered from their plan; per-prop re-entries on the
  // same declarator report whether THEIR prop was consumed (consumed subtrees are
  // skip-seeded), so an unconsumed (plan-verbatim) leaf keeps its fallback emission
  const flattenedDeclarators = new WeakSet();

  function resolveGlobalPure(name) {
    const pure = resolvePure({ kind: 'global', name });
    return pure && pure.kind !== 'instance' ? pure : null;
  }

  // the shared provider plan for a flatten-eligible host: the SAME decision tree unplugin
  // renders as text. babel's resolvePure already carries the mutated-static and disable
  // gates, so plan resolution matches the per-leaf detection pipeline. `declaratorNode` is
  // a real VariableDeclarator or the cascade's synthetic `{ id, init }` assignment host
  function buildFlattenPlan({ declaratorNode, scope, path, keepsTail = false }) {
    return buildNestedDestructurePlan({
      declarator: declaratorNode,
      scope,
      adapter,
      path,
      keepsTail,
      resolvePure: meta => resolvePure(meta),
      resolveGlobalPolyfill: resolveGlobalPure,
      isDisabledProp: isDisabled,
    });
  }

  // prune consumed props from the (possibly nested) pattern per the plan tree: a consumed
  // prop is removed outright, or - under a rest sibling - kept as a `key: _unused` sentinel
  // (rest gathers all OTHER own keys, so dropping a fully-consumed key would change runtime
  // semantics: `rest.Array` becomes defined, originally excluded). consumed subtrees are
  // skip-seeded so queued visitor re-entries short-circuit; verbatim survivors (including
  // `[Symbol.iterator]`-keyed props whose key the natural visitor polyfills) stay live
  function prunePatternByPlan(pattern, planNodes) {
    const hasRest = pattern.properties.some(isRestProperty);
    const removed = new Set();
    // sentinel names accumulate for the AssignmentExpression host, which must hoist
    // `var _unused;` declarations (a VariableDeclarator host declares them via the pattern)
    const unusedNames = [];
    for (const planNode of planNodes) {
      if (planNode.kind === 'consumed') {
        t.traverseFast(planNode.prop, node => { skippedNodes.add(node); });
        if (hasRest) {
          // a synth Symbol.iterator sentinel re-keys through the polyfilled binding so
          // engines without native `Symbol` can still evaluate the computed key (the
          // original key was skip-seeded above, so the natural visitor won't polyfill it)
          if (planNode.extractions?.[0]?.synth === 'symbol-iterator') {
            planNode.prop.key = t.cloneNode(injectPureImport('symbol/iterator', 'Symbol$iterator'));
          }
          const unusedId = generateUnusedId();
          unusedNames.push(unusedId.name);
          planNode.prop.value = unusedId;
          planNode.prop.shorthand = false;
        } else removed.add(planNode.prop);
      } else if (planNode.kind === 'rebuilt') {
        unusedNames.push(...prunePatternByPlan(planNode.pattern, planNode.children));
      }
    }
    if (removed.size) pattern.properties = pattern.properties.filter(p => !removed.has(p));
    return unusedNames;
  }

  // receiver for the synth Symbol.iterator extraction (`it = _getIteratorMethod(<recv>)`):
  // an ALIASED Identifier tail keeps the user binding (`obj` - its own init is polyfilled
  // independently), matching the unplugin render byte-for-byte; a direct proxy-global /
  // constructor receiver reads through its polyfill binding instead (the raw global would
  // ReferenceError on engines without it); anything else clones the SE-peeled tail verbatim
  function flattenSynthReceiver(initNode, plan) {
    const { tail } = peelNestedSequenceExpressions(initNode);
    const isAliasedIdentifier = tail?.type === 'Identifier' && tail.name !== plan.receiver;
    const pure = !isAliasedIdentifier && plan.receiver ? resolveGlobalPure(plan.receiver) : null;
    if (pure) return t.cloneNode(injectPureImport(pure.entry, pure.hintName));
    return t.cloneNode(tail);
  }

  // init for an ANCHORED (single-ctor-key proxy-hop) residual: the plan-resolved ctor
  // entry when present (`= _Map` - patch-visible for mutated statics, defined on
  // missing-global targets), else a member read off the proxy's own binding
  // (`= _globalThis.Math`). anchor keys come from the static-placement whitelist, so a
  // plain identifier key node is always valid
  function anchorInitNode(plan) {
    if (plan.anchorPure) return t.cloneNode(injectPureImport(plan.anchorPure.entry, plan.anchorPure.hintName));
    const proxyPure = resolveGlobalPure(plan.receiver);
    const root = proxyPure ? t.cloneNode(injectPureImport(proxyPure.entry, proxyPure.hintName)) : t.identifier(plan.receiver);
    return t.memberExpression(root, t.identifier(plan.anchor));
  }

  // unconditional proxy-hop trigger, wired into the MAIN usage-pure traversal (replaces the
  // dedicated normalize pre-pass traverse): an anchored plan must fire even when NO leaf
  // resolves (`{ Map: { customY } } = globalThis` - the whole point is the re-anchored
  // residual). cheap shape prefilter before any plan work; the host-value gates live in the
  // callees (declarator inits are never read; the cascade gates on statement context)
  function tryFlattenProxyHopHost(path) {
    const isDecl = path.isVariableDeclarator();
    const pattern = isDecl ? path.node.id : path.node.left;
    const init = isDecl ? path.node.init : path.node.right;
    if (!init || pattern?.type !== 'ObjectPattern' || pattern.properties.length !== 1) return;
    const [hopProp] = pattern.properties;
    if (!t.isObjectProperty(hopProp)) return;
    const inner = hopProp.value?.type === 'AssignmentPattern' ? hopProp.value.left : hopProp.value;
    if (inner?.type !== 'ObjectPattern') return;
    if (isDisabled(path.node)) return;
    if (isDecl) {
      renderDeclaratorFlattenPlan(path, null);
      return;
    }
    if (path.node.operator !== '=') return;
    const peeled = peelToExpressionStatement(path);
    if (peeled) cascadeAssignmentExpressionDestructure({ assignPath: path, prop: null, peeled });
  }

  // extraction declarators in plan order. a GLOBAL extraction registers a global alias
  // (member reads through the local keep resolving: `Symbol.iterator` off the extracted
  // `Symbol` -> `_Symbol$iterator`); a static-method extraction registers the body-extract
  // alias so receiver narrowing through the local keeps resolving post-mutation
  function buildExtractionDeclarators(plan, declarator) {
    const extracted = [];
    for (const outer of plan.outerProps) {
      for (const e of outer.extractions ?? []) {
        let init;
        if (e.synth === 'symbol-iterator') {
          init = t.callExpression(t.cloneNode(injectPureImport('get-iterator-method', 'getIteratorMethod')),
            [flattenSynthReceiver(declarator.node.init, plan)]);
        } else {
          if (e.kind === 'global') injector.registerGlobalAlias(e.localName, e.hint);
          else injector.registerBodyExtractAlias(e.localName, e.entry, declarator.scope.getBinding(e.localName));
          init = t.cloneNode(injectPureImport(e.entry, e.hint));
        }
        extracted.push(t.variableDeclarator(t.identifier(e.localName), init));
      }
    }
    return extracted;
  }

  // declaration-host renderer for the shared nested-flatten plan: ONE batch render on the
  // first dispatched leaf replaces the old per-prop incremental cascade. extraction order =
  // plan order = source order, matching both the old visit order and unplugin's text render.
  // hosts handled here ALWAYS win polyfill - native fallback would produce wrong runtime in
  // usage-pure mode (`from = globalThis.Array.from` picks native on modern engines)
  function renderDeclaratorFlattenPlan(declarator, prop) {
    const declaration = declarator.parentPath;
    if (!declaration?.isVariableDeclaration()) return false;
    if (flattenedDeclarators.has(declarator.node)) return !!prop && skippedNodes.has(prop.node);
    const plan = buildFlattenPlan({ declaratorNode: declarator.node, scope: declarator.scope, path: declarator });
    if (!plan) return false;
    flattenedDeclarators.add(declarator.node);
    // for-init with SequenceExpression init - external statement-lift unavailable (the loop
    // header forbids non-declarator statements); the SE becomes a dedicated sink declarator.
    // unwrapRuntimeExpr peels Paren / Chain / TS expression wrappers so `((se(), R) as any)`
    // still trips the SE-preservation branch
    const forInitRaw = unwrapRuntimeExpr(declarator.node.init);
    const isForInit = declaration.parentPath?.isForStatement()
      && declaration.parentPath.node.init === declaration.node;
    const isForInitWithSE = isForInit && forInitRaw?.type === 'SequenceExpression';
    const declCount = declaration.node?.declarations?.length ?? 1;
    const extracted = buildExtractionDeclarators(plan, declarator);
    prunePatternByPlan(plan.pattern, plan.outerProps);
    const patternEmpties = plan.pattern.properties.length === 0;
    // ANCHORED residual: rebuild the declarator as `<innerPattern> = <ctorBinding>` - the
    // hop wrapper and the proxy read are dead (every surviving read goes through the
    // constructor). the old init subtree is skip-seeded so the detached proxy root doesn't
    // earn a dead import
    if (plan.anchor && !patternEmpties) {
      const oldInit = declarator.node.init;
      declarator.node.id = plan.pattern;
      declarator.node.init = anchorInitNode(plan);
      t.traverseFast(oldInit, node => { skippedNodes.add(node); });
    }
    // an SE-bearing chain-root call / chain-assignment in the DISCARDED init: re-emit it as
    // a sequence prefix on the LAST extraction so the setup still runs, exactly once (a
    // partial consume KEEPS the declarator with its init, so the setup already runs there).
    // the CLONE is traversed on insertion, so its inner references (`globalThis`) still earn
    // their own substitutions; the original init subtree stays skipped with the declarator
    if (patternEmpties && plan.discardSe) {
      const last = extracted.at(-1);
      last.init = t.sequenceExpression([t.cloneNode(plan.discardSe), last.init]);
    }
    // seed skippedNodes for the subtree about to be orphaned so scheduled visitor re-entries
    // short-circuit. for-init+SE preserves the init (under a sink id), so its inner
    // Identifier visits (`globalThis` inside `(se(), globalThis)`) still need to fire for
    // substitution - restrict the skip to the pattern (id) in that case. NOT calling
    // scope.registerDeclaration on new bindings: it trips "Duplicate declaration" when the
    // enclosing scope.crawl() later re-scans
    if (patternEmpties) {
      t.traverseFast(isForInitWithSE ? declarator.node.id : declarator.node,
        node => { skippedNodes.add(node); });
    }
    // for-init+SE full consume: convert the orphan declarator to an SE-sink. the sink init
    // is REBUILT as a bare flattened sequence - transparent wrappers (TS casts) and nested
    // sequence parens are dead on the discarded sink slot, and the bare shape is the
    // plan-canonical sink both emitters emit
    if (isForInitWithSE && patternEmpties) {
      const { prefix, tail } = peelNestedSequenceExpressions(forInitRaw);
      declarator.node.id = generateUnusedId();
      declarator.node.init = t.sequenceExpression([...prefix, tail]);
      declarator.insertBefore(extracted);
      return !!prop && skippedNodes.has(prop.node);
    }
    // multi-decl + full consume + SE prefix: split declaration around the consumed slot so
    // sibling evaluation order survives (pre-sibling inits with inline SEs must run BEFORE
    // the lifted SE). no-SE multi-decl flows through the `declaration.insertBefore` + splice
    // path below to keep its established shape
    if (trySplitAroundConsumedDeclarator({
      declaration, declarator, extractedDeclarators: extracted, willRemoveDeclarator: patternEmpties, declCount, isForInit,
    })) return !!prop && skippedNodes.has(prop.node);
    // declarator-level insert in for-init keeps loop-header shape; declaration-level insert
    // would wrap for-init in an arrow-IIFE. lift the receiver SE (descending a transparent
    // array wrapper that hides it one ArrayExpression level down) for both partial and full
    // consume - the residual / replacement must not re-run the prefix
    if (!isForInit) liftDeclaratorInitSE(t, declarator.node, declaration);
    // host wrapped in `export const { ... } = X` - every emitted statement re-exports its
    // bindings. for-init can't host export statements (loop header)
    const declIsExport = !isForInit && declaration.parentPath?.isExportNamedDeclaration();
    if (patternEmpties && declCount === 1 && !isForInit) {
      // single-declarator full consume: replace the declaration with the extraction
      // statements (replaceWith preserves leading comments on the single-statement shape)
      const stmts = extracted.map(d => wrapAsExportIf(t.variableDeclaration(declaration.node.kind, [d]), declIsExport));
      const target = declIsExport ? declaration.parentPath : declaration;
      if (stmts.length === 1) target.replaceWith(stmts[0]);
      else {
        liftLeadingComments(declaration.node, stmts[0]);
        target.replaceWithMultiple(stmts);
      }
      return !!prop && skippedNodes.has(prop.node);
    }
    // multi-decl / for-init: declarator-level insert keeps the extractions AT THEIR SOURCE
    // SLOT relative to sibling declarators (a declaration-level insertBefore hoisted them
    // above pre-siblings - a reorder observable when pre-sibling inits carry effects; the
    // loop header forbids statement inserts outright); the post-traverse split drain renders
    // the statement-per-declarator canon and re-applies the export wrap. a single-declarator
    // host keeps the statement-level insert so later same-declaration emissions (an instance
    // residual-extract) anchor after it in dispatch order
    if (extracted.length) {
      if (isForInit || declCount > 1) declarator.insertBefore(extracted);
      else {
        const newDecls = extracted.map(d => wrapAsExportIf(t.variableDeclaration(declaration.node.kind, [d]), declIsExport));
        liftLeadingComments(declaration.node, newDecls[0]);
        (declIsExport ? declaration.parentPath : declaration).insertBefore(newDecls);
      }
    }
    if (patternEmpties) {
      // splice out the emptied declarator in-place; `.remove()` mid-traversal nulls
      // path.parent and crashes babel's virtual-type filter on queued inner Identifiers
      const idx = declaration.node.declarations.indexOf(declarator.node);
      if (idx !== -1) declaration.node.declarations.splice(idx, 1);
    }
    // a surviving multi-declarator host (partial consume / preserved siblings) joins the
    // post-traverse split drain like the flat executor's hosts - the statement-per-declarator
    // canon applies to plan-rendered declarations too
    if (!isForInit && declaration.node?.declarations?.length > 1) flatTouchedMultiDecls.add(declaration);
    return !!prop && skippedNodes.has(prop.node);
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

  // multi-element ArrayPattern wrapping the consumed ObjectPattern (`const [, { from }] = [Set, Array]`,
  // or nested `const [{ Array: { from } }, other] = [globalThis, {...}]`): the cascade flatten bails
  // because dropping the whole declarator would lose the sibling / hole bindings. extract the static
  // into a `const <local> = _Polyfill` before the host and rename the consumed key to `_unused` in
  // place, leaving the residual array destructure (siblings, holes, init array) intact so every other
  // target keeps binding - "polyfill always wins" without disturbing them. static keys only: an
  // instance method needs a concrete receiver the residual array slot can't supply here
  function tryExtractArrayWrappedStatic(prop, entry, hintName, kind) {
    // static keys only: an instance method needs a concrete receiver the residual array can't supply
    if (kind === 'instance') return false;
    const valueNode = propBindingIdentifier(prop.node.value);
    if (!valueNode) return false;
    const host = findArrayWrappedDestructureHost(prop.parentPath);
    if (!host?.needsResidualExtraction) return false;
    const declaration = host.declarator.parentPath;
    if (!declaration?.isVariableDeclaration()) return false;
    // export host re-exports the extracted binding too (`export const from = _Array$from`)
    const isExport = declaration.parentPath?.isExportNamedDeclaration();
    injector.registerBodyExtractAlias(valueNode.name, entry, prop.scope.getBinding(valueNode.name));
    const id = injectPureImport(entry, hintName);
    const extracted = t.variableDeclaration(declaration.node.kind,
      [t.variableDeclarator(t.cloneNode(valueNode), t.cloneNode(id))]);
    (isExport ? declaration.parentPath : declaration)
      .insertBefore(isExport ? t.exportNamedDeclaration(extracted, []) : extracted);
    // rename the consumed key to `_unused`: the residual array destructure keeps its shape
    // (siblings / holes / the init array survive) and the new `const <local>` shadows it
    prop.get('value').replaceWith(generateUnusedId());
    prop.node.shorthand = false;
    skippedNodes.add(prop.node);
    return true;
  }

  // keep a destructure key IN the residual pattern (its value renamed to `_unused`) and extract the
  // polyfill into a preceding `const <local> = ...`. used for a side-effecting computed key (the effect
  // runs once, in source order, in the kept key) AND for a nested INSTANCE method (the polyfill
  // `_m(receiver)` needs the receiver, which the residual preserves). leaves the residual destructure
  // (siblings + receiver) intact - "polyfill always wins" without reordering effects. mirrors
  // `tryExtractArrayWrappedStatic`. returns false when it can't safely extract (no binding name, or an
  // instance receiver that isn't a bare Identifier -> would double-evaluate, since the residual reads it
  // too); the caller then leaves it native
  function keepKeyInResidual({ prop, kind, entry, hintName, declaration, siblingDeclarator, objectNode }) {
    const valueNode = propBindingIdentifier(prop.node.value);
    if (!valueNode) return false;
    let polyfillValue;
    if (kind === 'instance') {
      // the polyfill `_m(receiver)` re-references the receiver (the residual reads it too). the planner
      // (`planSideEffectKeyStrategy`) already admitted only re-referenceable receivers, so clone directly -
      // no local re-check (a duplicate gate here once drifted from the planner and left a literal native)
      polyfillValue = t.callExpression(injectPureImport(entry, hintName), [t.cloneNode(objectNode)]);
    } else {
      // global ctor (`{ [(eff(), 'Promise')]: P } = globalThis`): register a GLOBAL alias so member reads
      // re-polyfill (`P.allSettled` -> the pure static). ALSO registering it as a body-extract alias would
      // clobber that and leave the member read raw against the bare ctor (which lacks the static) -> a
      // TypeError on ie:11. static method (`{ [(eff(), 'from')]: from } = Array`): body-extract alias so
      // post-rewrite narrowing resolves the extracted local. both bind the local to the pure import
      // (`const P = _Promise` / `const from = _Array$from`) and keep the SE-key as a `_unused` residual
      if (kind === 'global') injector.registerGlobalAlias(valueNode.name, hintName);
      else injector.registerBodyExtractAlias(valueNode.name, entry, prop.scope.getBinding(valueNode.name));
      polyfillValue = t.cloneNode(injectPureImport(entry, hintName));
    }
    if (siblingDeclarator) {
      // a preceding statement is impossible (loop header) or unsafe (a multi-declarator instance receiver
      // bound earlier in the same declaration would TDZ-fault) - bind the polyfill as a trailing sibling
      const trailing = t.variableDeclarator(t.cloneNode(valueNode), polyfillValue);
      attachToPrevDeclarator.add(trailing);
      declaration.node.declarations.push(trailing);
    } else {
      const isExport = declaration.parentPath?.isExportNamedDeclaration();
      const extracted = t.variableDeclaration(declaration.node.kind,
        [t.variableDeclarator(t.cloneNode(valueNode), polyfillValue)]);
      (isExport ? declaration.parentPath : declaration)
        .insertBefore(isExport ? t.exportNamedDeclaration(extracted, []) : extracted);
    }
    prop.get('value').replaceWith(generateUnusedId());
    prop.node.shorthand = false;
    skippedNodes.add(prop.node);
    return true;
  }

  // dispatch a polyfillable key whose KEY must stay in the pattern - either a side-effecting computed key
  // (`{ [(eff(), 'from')]: from } = R`, the effect runs in place) OR a nested INSTANCE method (the polyfill
  // `_m(receiver)` needs the receiver the residual preserves). the ONE robust emission (decided by the
  // shared `planSideEffectKeyStrategy`): keep the key IN PLACE (value renamed to a throwaway) and bind the
  // polyfill separately - uniform across statement / nested / for-init / rest / default / export / array-
  // wrapper / nested-sequence keys. a param-default / IIFE host can't host that separate binding, so it
  // synth-swaps the receiver instead. returns true when handled (caller stops); false lets the caller
  // continue (no host declaration)
  function handleSideEffectComputedKey({ prop, kind, entry, hintName }) {
    const objectPattern = prop.parentPath;
    const { parent: synthHost } = peelTransparentWrappers(objectPattern);
    // param-default / IIFE host (static): no room for a separate binding statement -> synth-swap receiver
    if (kind !== 'instance' && !synthHost?.isVariableDeclarator() && !synthHost?.isObjectProperty()) {
      handleParameterDestructure({ prop, kind, entry, hintName });
      return true;
    }
    const declaration = hostDeclarationOf(prop);
    if (!declaration) return false;
    const isForInit = declaration.parentPath?.isForStatement()
      && declaration.parentPath.node.init === declaration.node;
    // resolve the instance receiver once: the planner needs its kind, `keepKeyInResidual` the node
    const objectNode = kind === 'instance'
      ? resolveDestructuringObject(prop, resolvePropertyObjectType(prop)) : null;
    const plan = planSideEffectKeyStrategy({
      polyfillKind: kind,
      isForInit,
      isMultiDeclarator: declaration.node.declarations.length > 1,
      receiverIsSafe: isReReferenceableReceiver(objectNode),
    });
    // null = an instance receiver the residual can't safely re-reference (non-Identifier / multi-declarator).
    // leave the destructure NATIVE (return handled): falling through to the default instance extract would
    // discard the whole destructure and with it the key's EFFECT. unplugin likewise leaves it native
    if (!plan) return true;
    return keepKeyInResidual({ prop, kind, entry, hintName, declaration, siblingDeclarator: plan.siblingDeclarator, objectNode });
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
    if (!meta?.fromFallback && prop.node.computed && sequenceKeyPrefix(prop.node.key)
      && handleSideEffectComputedKey({ prop, kind, entry, hintName })) return;
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
      handleParameterDestructure({ prop, kind, entry, hintName, meta });
      return;
    }
    // multi-element ArrayPattern wrapper around the consumed pattern (`[, { from }] = [Set, Array]`,
    // nested `[{ Array: { from } }, other] = [globalThis, ...]`): the cascade flatten can't drop the
    // declarator without losing sibling / hole bindings, so extract the static and keep the residual
    if (tryExtractArrayWrappedStatic(prop, entry, hintName, kind)) return;
    // nested proxy-global destructure: `{ Array: { from } } = globalThis`. default
    // (`from = _Array$from`) wouldn't fire - `globalThis.Array` is always present and
    // `Array.from` is non-undefined on every engine we target (may just be buggy).
    // flatten the outer structure when it's a single-nested shape: replace the whole
    // VariableDeclarator with `const from = _Array$from` so the polyfill ALWAYS wins
    if (patternParent?.isObjectProperty() && kind !== 'instance') {
      if (tryFlattenNestedProxyDestructure(prop)) return;
      // fallback: non-single shape (outer has siblings) - inline default as last resort
      handleParameterDestructure({ prop, kind, entry, hintName, meta });
      return;
    }
    // nested INSTANCE method (`{ y: { flat: m } } = { y: arr }`, or array-wrapped `[{ y: { flat: m } }] =
    // [{ y: arr }]` / `[{ flat: m }] = [arr]`): the static flatten doesn't apply (the receiver is an
    // instance, not a constructor). delegate to the shared declarator-key residual path - it resolves the
    // nested receiver through object keys AND array indices (bare Identifier only, else native), respects
    // the planner (bails a multi-declarator / non-Identifier receiver, routes a for-init to a sibling
    // declarator), and extracts `const m = _flatMaybeArray(recv)`. an ArrayPattern host peels past
    // `patternParent` (a single-element wrapper collapses to the declarator), so gate on it directly
    if ((patternParent?.isObjectProperty() || objectPattern.parentPath?.isArrayPattern()) && kind === 'instance') {
      if (handleSideEffectComputedKey({ prop, kind, entry, hintName })) return;
      // an ASSIGNMENT host has no declaration to extract a `const` into. for a statement-context assignment
      // with a bare-Identifier binding and a re-referenceable receiver, append `m = _flatMaybeArray(recv)`
      // AFTER the statement: the destructure assigns `m` natively first (undefined on engines lacking the
      // method), then this overwrite makes the polyfill win. expression-context / member-receiver bails to
      // native. `resolveNestedReceiverNode` already gates the receiver (Identifier / side-effect-free literal)
      const statement = nestedAssignmentStatementOf(prop);
      const receiverNode = resolveNestedReceiverNode(prop);
      if (statement && prop.node.value?.type === 'Identifier' && receiverNode && !skippedNodes.has(prop.node)) {
        // mark handled so a re-visit (babel re-crawls after the insertAfter mutation) doesn't append
        // a second identical overwrite
        skippedNodes.add(prop.node);
        // chain each overwrite off the previous one for this statement: the elements of a multi-element
        // pattern (`[{ flat: x }, { at: x }] = [a, b]`) must overwrite in SOURCE order so the last one
        // wins, as native destructuring does - a bare `statement.insertAfter` per element reverses them
        const overwriteStmt = t.expressionStatement(t.assignmentExpression('=', t.cloneNode(prop.node.value),
          t.callExpression(injectPureImport(entry, hintName), [t.cloneNode(receiverNode)])));
        const prevInsert = nestedOverwriteLastInsert.get(statement.node);
        nestedOverwriteLastInsert.set(statement.node, (prevInsert ?? statement).insertAfter(overwriteStmt)[0]);
      }
      return;
    }
    // transparent wrap between ObjectPattern and host (`const [{from}] = wrapper` -
    // ArrayPattern peeled): no outer Property to inline a default on, so try flatten
    // directly. `peelTransparentWrappers` walks the same wrappers inside the flatten
    // chain walk, so the rewrite reaches the same VariableDeclarator. bail silently
    // when flatten can't (multi-prop ObjectPattern, complex shape) since there's no
    // alternative emission path for ArrayPattern-wrapped destructures
    if (objectPattern.parentPath?.node !== patternParent?.node && kind !== 'instance') {
      // ArrayPattern wrap + rest sibling flows into the same rest-aware cascade as the unwrapped
      // shapes: babel's sentinel rename mutates the pattern IN PLACE and unplugin splices the
      // rebuilt pattern back into the original LHS text, so the wrap survives on both and rest
      // keeps reading the matching init element
      tryFlattenNestedProxyDestructure(prop);
      return;
    }
    if (!canTransformDestructuring(prop)) return;
    // export + rest of a static: polyfill it like the nested-proxy export+rest path - the
    // consumed key renames to `_unused` (a named export, as the nested path also emits) and the
    // extracted static binds via the new `const <local> = _Polyfill`. skipping here would leave
    // the static native and undefined on engines without it ("polyfill always wins")
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
      // the `let x; ({ x } = Source)` form: the destructure's own write is the aliasing
      // event, not a disqualifying reassignment - pass it so the registrar excludes it
      // from the violation count (otherwise the alias is rejected and receiver narrowing
      // through `x` falls to the generic instance variant)
      if (localName) {
        injector.registerBodyExtractAlias(localName, entry, prop.scope.getBinding(localName),
          enclosingDestructureAssignment(prop));
      }
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
    // only a prop whose KEY resolves to a pure polyfill via the typeless catch meta gets
    // rewritten against the `_ref` receiver (`{ at }` -> `let at = _at(_ref)`); a
    // non-polyfillable name (`{ message }`) gets no rewrite, so restructuring for it is
    // pure churn the unplugin twin never produces - its transform fires only off a
    // resolved prop to begin with
    const resolvableProps = param.properties.filter(p => {
      if (p.type !== 'ObjectProperty' || p.computed) return false;
      const key = p.key?.name ?? p.key?.value ?? null;
      return key !== null && !!resolvePure({ kind: 'property', object: null, key, placement: null }, path);
    });
    // computed keys host the symbol / SE-key machinery - keep their unconditional
    // extraction. otherwise extraction needs a rewrite-bound prop AND a pattern-level
    // reason: a rest sibling (the `_unused` sentinel preserves its exclusion) or a
    // default on the resolved key (the guarded `_ref`-read rewrite); a plain resolved
    // prop matters only when the body actually reads it. plain `{ code = 1 }` /
    // rest-only patterns destructure in place
    if (!param.properties.some(p => p.computed)) {
      if (!resolvableProps.length) return;
      const needsPatternRewrite = param.properties.some(isRestProperty)
        || resolvableProps.some(p => p.value?.type === 'AssignmentPattern');
      if (!needsPatternRewrite) {
        const destructuredNames = new Set();
        for (const p of resolvableProps) {
          if (p.value?.type === 'Identifier') destructuredNames.add(p.value.name);
        }
        if (!destructuredNames.size) return;
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
    }
    // use our own `_ref, _ref2, ...` generator instead of babel's `scope.generateUidIdentifier`
    // - keeps one naming scheme across the plugin and matches unplugin's output shape
    const ref = injector.generateLocalRef(path.scope);
    const relocated = t.variableDeclaration('let', [t.variableDeclarator(param, ref)]);
    catchBornDeclarations.add(relocated);
    path.get('body').unshiftContainer('body', [relocated]);
    path.node.param = ref;
  }

  // ---------- per-prop AST emission (strategy-dispatched) ----------

  // resolve the destructure init (VariableDeclarator.init / AssignmentExpression.right) -
  // memoize non-identifier init when other properties remain to avoid double evaluation
  function resolveDestructuringObject(path, typeOfReceiver) {
    const parent = path.parentPath.parentPath;
    const initKey = parent.isVariableDeclarator() ? 'init'
      : parent.isAssignmentExpression() ? 'right' : null;
    if (!initKey) return resolveNestedReceiverNode(path);
    const objectNode = parent.node[initKey];
    if (!objectNode) return null;
    if (!t.isIdentifier(objectNode) && path.parentPath.node.properties.length > 1) {
      // the ctor the receiver resolves to (peel SE prefix, zero-arg IIFE return, paren / TS wrappers,
      // walk proxy-global hops) - drives both the inline decision and the memo's global-alias name
      const proxyCtor = globalProxyMemberName({ node: peelProxyGlobalObject(objectNode), scope: path.scope, adapter, path });
      // a NO-SE receiver resolving to a bare pure-ctor (`globalThis.Promise`, incl. a hop) is a single
      // SE-free reference: return it RAW (no memoize, no collapse) and let the natural visitor substitute
      // it to the pure import (`-> _Promise`) - exactly the non-symbol-iter / single-prop fall-through.
      // a memo `_ref`, or collapsing to `_globalThis.Promise` (then re-substituted), would be superfluous;
      // the substituted import resolves sibling reads on its own. an SE prefix still memoizes (SE once)
      if (proxyCtor && peelNestedSequenceExpressions(objectNode).prefix.length === 0
        && resolveGlobalPure(proxyCtor)) return objectNode;
      // collapse a proxy-global hop before memoizing (`globalThis.self.Array` -> `globalThis.Array`) -
      // the same collapse the retained-residual path applies - so the memo isn't `_globalThis.self.Array`,
      // whose `.self` is runtime-undefined on ie:11 / Node
      collapseRetainedProxyReceiver(synthSwap, parent.node, initKey, aliasCtxFromPath(parent));
      const receiver = parent.node[initKey];
      // declare=false: we emit our own `const _ref = init;` below, no extra `var _ref;`
      const ref = generateLocalRef(path.scope);
      // sibling-declarator insert keeps the memo AT ITS SOURCE SLOT (a declaration-level
      // insertBefore hoisted it above earlier declarators - a side-effect reorder). on a
      // VariableDeclarator host the post-traverse split renders it as a standalone `const`;
      // for-init keeps the comma shape (loop header). an AssignmentExpression host has no
      // declarator list, so it keeps the preceding-statement insert
      if (parent.isVariableDeclarator()) {
        const memoDeclarator = t.variableDeclarator(ref, receiver);
        memoDeclarators.add(memoDeclarator);
        parent.insertBefore(memoDeclarator);
      } else parent.parentPath.insertBefore(t.variableDeclaration('const', [
        t.variableDeclarator(ref, receiver),
      ]));
      const cloned = t.cloneNode(ref);
      // store resolved type for subsequent destructured properties to resolve type hints
      if (typeOfReceiver) resolvedType.set(cloned, typeOfReceiver);
      // a memoized proxy-global-member receiver (`_ref = _globalThis.Array`) is registered as a global
      // alias for its ctor so SIBLING statics destructured off `_ref` re-polyfill - a `[Symbol.iterator]`
      // key has no instance type, so the resolvedType channel above doesn't carry the ctor, and the
      // inserted `_ref` is not scope-registered, leaving `from` native otherwise (undefined on ie:11)
      if (proxyCtor) injector.registerGlobalAlias(ref.name, proxyCtor);
      parent.node[initKey] = cloned;
      return ref;
    }
    return objectNode;
  }

  // bodyless control statement with side-effect: wrap in block to keep scope.
  // `cloneDeep` is necessary - the original `initNode` is still referenced by the
  // about-to-be-replaced declaration's path; reusing it would create node-identity aliasing
  // that babel's path tracker mishandles. expensive (deep walk) but bounded by init AST size.
  // the lifted init is TRIMMED like every other lift (`sideEffect();`, not
  // `sideEffect(), Array;`) - the trailing value is unread once extraction consumed the
  // bindings, the uniform canon both emitters emit.
  // multi-decl host (`var a=1, {p}=SE(), b=2`): sibling declarators preserve their original
  // position around the consumed slot. pre-siblings run before the lifted SE, post-siblings
  // after the extracted target. a collapsed-trailing emission would silently reorder
  // pre-sibling initializers past the SE expression, observable when both sides carry effects
  function wrapBodylessWithSideEffect({ declaration, initNode, parentDeclarator, extractedDeclaration, kind }) {
    const decls = declaration.node.declarations;
    const idx = decls.indexOf(parentDeclarator);
    const stmts = [];
    if (idx > 0) stmts.push(t.variableDeclaration(kind, decls.slice(0, idx)));
    stmts.push(t.expressionStatement(trimSideEffectTail(t.cloneDeep(initNode))), extractedDeclaration);
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
      // static polyfill import - SE needs a dummy binding to stay in for-init. the sink
      // lands BEFORE every extraction of this declaration (SE-first, source-faithful),
      // not at the consumed slot where earlier per-prop inserts would precede it
      const ref = generateLocalRef(scope);
      const decls = declaration.node.declarations;
      const idx = decls.indexOf(parent.node);
      if (idx === -1) return;
      const sink = t.variableDeclarator(ref, t.cloneDeep(parent.node.init));
      decls.splice(idx, 1, t.variableDeclarator(localBinding, value));
      const firstExtraction = decls.findIndex(d => forInitExtractionDecls.has(d));
      decls.splice(firstExtraction === -1 ? idx : firstExtraction, 0, sink);
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

  // `(inner(), Array)` - when we lift the init as a standalone statement only the
  // side-effectful head is needed; the trailing value (`Array`, read by the destructure)
  // becomes a no-op read once extraction leaves no destructure target. trim it so the
  // emitted ExpressionStatement reads `inner();` instead of `inner(), Array;`. nested SE
  // (`(x++, (y++, Array))`) is flattened first so the inner trailing identifier strips too -
  // without the flatten the outer trim stops at `(y++, Array)` (which has
  // its own `mayHaveSideEffects` from `y++`), leaving a useless `Array` read in the output
  function trimSideEffectTail(node) {
    if (!t.isSequenceExpression(node)) return node;
    // the canonical peel flattens nested sequence layers, so the dead-tail pop can drop a
    // final no-op parked under an inner SE wrapper too
    const { prefix, tail } = peelNestedSequenceExpressions(node);
    const flat = dropDeadSequenceTail([...prefix, tail]);
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

  // a flat STATIC destructure (`const { from, of } = Array`) is a degenerate flatten -
  // receiver + consumed static props, no instance/nested. route it
  // through the SAME shared-plan renderer the nested/proxy path uses (`renderDeclaratorFlattenPlan`),
  // retiring the per-prop strategy path for these shapes. the renderer self-gates on plan
  // existence (instance props plan as verbatim -> no extractions -> no plan -> falls through),
  // and handles full-consume / residual / rest / export / for-init / multi-declarator uniformly.
  // the plan resolves a bare-Identifier receiver itself (a const-alias chain, a proxy-global
  // shorthand) - both route correctly. EXCLUDED shapes (kept on the per-prop strategy path,
  // where the plan render would diverge byte-wise from the established per-prop / unplugin canon):
  //   - a non-Identifier init (member / sequence / logical / optional - `globalThis['self'].Array`,
  //     `(se(), Array)`, `Array || Promise`): needs the per-prop intermediate-hop collapse
  //     (`globalThis['self'].Array` -> `_globalThis.Array`) and SE-discard the flat-residual
  //     plan path doesn't reproduce
  //   - a default prop (`{ from = d() }`): the flat path keeps the always-true guard
  //     `_X === void 0 ? d() : _X`, the plan drops it (equivalent, but byte-divergent)
  //   - a leading comment on the declaration: the per-prop path leaves it between the split
  //     statements, the plan render lifts it to the first - byte-divergent on multi-statement output
  // those canon merges are separate increments. an AssignmentExpression host has no plan-render here
  function tryRouteFlatStaticToPlan(prop) {
    const objectPattern = prop.parentPath;
    if (!objectPattern.isObjectPattern()) return false;
    const declarator = objectPattern.parentPath;
    if (!declarator?.isVariableDeclarator() || objectPattern.node !== declarator.node.id) return false;
    const { init } = declarator.node;
    if (!t.isIdentifier(init)) return false;
    if (objectPattern.node.properties.some(p => t.isObjectProperty(p) && t.isAssignmentPattern(p.value))) return false;
    // a computed key (`[Symbol.iterator]: it`) has no resolvePure entry, so the plan leaves it a
    // verbatim survivor - re-rendering the whole declarator here would clobber the per-prop symbol-key
    // extraction (`it = _getIteratorMethod(_ref)`). keep computed-key patterns on the per-prop path,
    // where the symbol key and its sibling statics each emit independently
    if (objectPattern.node.properties.some(p => t.isObjectProperty(p) && p.computed)) return false;
    if (declarator.parentPath?.node?.leadingComments?.length) return false;
    return renderDeclaratorFlattenPlan(declarator, prop);
  }

  // babel-plugin's destructure emission counterpart of unplugin's `handleDestructuringPure`.
  // dispatches on the parser-agnostic `planDestructureEmission` strategy enum, then
  // executes the strategy-specific AST mutation. planning logic lives in
  // `./destructure-emission-plan.js` so it stays parser-agnostic and unit-testable;
  // this function owns the babel AST-mutation side
  function handleDestructuredProperty(prop, value) {
    // flat STATIC shapes render through the shared-plan renderer (see `tryRouteFlatStaticToPlan`)
    if (tryRouteFlatStaticToPlan(prop)) return;
    const propValue = prop.node.value,
          // captured before default-value processing turns Identifier into ConditionalExpression
          isStaticValue = t.isIdentifier(value);
    const objectPattern = prop.parentPath;
    // a catch-born host folds the default-guard test ref into its own `let` (block-scoped,
    // minted without the `var` hoist) - the catch-canon shape both emitters emit
    const catchBorn = objectPattern.parentPath?.isVariableDeclarator()
      && catchBornDeclarations.has(objectPattern.parentPath.parentPath?.node);
    let catchFoldedRef = null;
    // default value: { from = [] } = Array -> from = _from === void 0 ? [] : _from
    // instance calls need temp ref to avoid double evaluation
    let localBinding;
    if (t.isAssignmentPattern(propValue)) {
      localBinding = t.cloneNode(propValue.left);
      const needsTemp = t.isCallExpression(value);
      // prop.node anchors the loop-header escape check: a for-init host needs the memo `var`
      // BEFORE the loop, not in a block-converted bodyless body
      const ref = needsTemp ? catchBorn ? generateLocalRef(prop.scope) : generateRef(prop.scope, prop.node) : value;
      if (needsTemp && catchBorn) catchFoldedRef = t.cloneNode(ref);
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
      const unusedId = generateUnusedId();
      prop.get('value').replaceWith(unusedId);
      prop.node.shorthand = false;
      // a sentinel on an ASSIGNMENT host is a plain LHS write - pre-declare it
      // (`var _unused;`) or strict mode throws ReferenceError; a declaration host binds it
      // via the destructure pattern itself
      if (parent.isAssignmentExpression()) {
        const stmt = peelParenAndTSParentPath(parent);
        if (stmt?.node?.type === 'ExpressionStatement') {
          stmt.insertBefore(t.variableDeclaration('var', [t.variableDeclarator(t.identifier(unusedId.name))]));
        }
      }
    }

    // residual destructure keeps the receiver (a surviving sibling or ...rest reads off it) -
    // collapse a proxy-global member chain so the retained init / right is runtime-safe
    if (hasRest || !isEmpty) {
      if (parent.isVariableDeclarator()) collapseRetainedProxyReceiver(synthSwap, parent.node, 'init', aliasCtxFromPath(parent));
      else if (parent.isAssignmentExpression()) collapseRetainedProxyReceiver(synthSwap, parent.node, 'right', aliasCtxFromPath(parent));
    }

    if (parent.isVariableDeclarator()) {
      emitVariableDeclaratorDestructure({ prop, parent, localBinding, value, isStaticValue, isEmpty, catchFoldedRef });
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

  // @babel/traverse@8 stale-path fixup: an earlier emit in the same handleObjectPropertyResult
  // chain (cascade extraction) may have wrapped a bodyless VariableDeclaration in BlockStatement
  // and `parent.parentPath` now points at the wrapper. raw `parent.parent` is still the real
  // VariableDeclaration - scan the wrapper's children for the matching path. babel@7's tracker
  // kept paths in sync so this is a no-op there
  function resolveDeclarationPath(declaratorPath) {
    const declaration = declaratorPath.parentPath;
    if (declaration.isBlockStatement() && declaratorPath.parent?.type === 'VariableDeclaration') {
      const rebound = declaration.get('body').find(p => p.node === declaratorPath.parent);
      if (rebound) return rebound;
    }
    return declaration;
  }

  // kind snapshot resilient to downstream path-orphaning. fall through declaration -> statement
  // parent -> `var` (the only kind valid inside bodyless control hosts where wrap fires).
  // @babel/types@7 silently accepted undefined in variableDeclaration builders; v8 throws
  function snapshotDeclarationKind(declaration) {
    return declaration.node.kind ?? findStatementParent(declaration).node?.kind ?? 'var';
  }

  // VariableDeclarator branch executor. classifies the host shape, asks the planner
  // for a strategy, then dispatches to the matching AST mutation
  function emitVariableDeclaratorDestructure({ prop, parent, localBinding, value, isStaticValue, isEmpty, catchFoldedRef = null }) {
    const declaration = resolveDeclarationPath(parent);
    // save original index before first insertBefore shifts it
    if (!originalDeclKeys.has(declaration.node)) {
      originalDeclKeys.set(declaration.node, findStatementParent(declaration).key);
    }
    const kind = snapshotDeclarationKind(declaration);
    const extractedDeclaration = t.variableDeclaration(kind, [
      ...catchFoldedRef ? [t.variableDeclarator(catchFoldedRef)] : [],
      t.variableDeclarator(localBinding, value),
    ]);
    const ctx = classifyVariableDeclaratorSite({ declaration, parent, isStaticValue, isEmpty });
    if (ctx.isMultiDecl && !ctx.isForInit) flatTouchedMultiDecls.add(declaration);
    const strategy = planDestructureEmission(ctx);
    switch (strategy) {
      case STRATEGIES.WRAP_BODYLESS_SE:
        return wrapBodylessWithSideEffect({
          declaration,
          initNode: parent.node.init,
          parentDeclarator: parent.node,
          extractedDeclaration,
          kind,
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
        // path-API replaceWith (NOT a raw declarations.splice) keeps queued sibling-declarator
        // paths in sync - a raw splice desyncs path.key and orphans the sibling subtrees'
        // pending visits (their inner polyfills would silently drop). the statement-per-
        // declarator split happens in the post-traverse `splitFlatMultiDecls` drain
        return parent.replaceWith(t.variableDeclarator(localBinding, value));
      case STRATEGIES.INSERT_BEFORE_DECLARATOR: {
        // `parent.insertBefore` (VariableDeclarator-level) keeps babel-traverse path.key of
        // queued sibling declarators in sync. `declaration.insertBefore` would wrap a
        // for-init in an arrow-IIFE and lose the loop-header shape
        const extractedDeclarator = t.variableDeclarator(localBinding, value);
        if (ctx.isForInit) forInitExtractionDecls.add(extractedDeclarator);
        return parent.insertBefore(extractedDeclarator);
      }
      case STRATEGIES.INSERT_BEFORE_EXPORT:
        return declaration.parentPath.insertBefore(t.exportNamedDeclaration(extractedDeclaration));
      case STRATEGIES.INSERT_BEFORE_DECLARATION:
        return declaration.insertBefore(extractedDeclaration);
      default:
        throw new Error(`[core-js] destructure-emitter: unhandled destructure strategy ${ strategy }`);
    }
  }

  // wrap declarators into VariableDeclaration statements. when any declarator still
  // carries an unconsumed ObjectPattern, keep them grouped so later visitor passes see
  // an intact multi-decl; otherwise emit one statement per declarator. shared by
  // `spliceAndLiftSideEffect` (pre/post
  // halves around a lifted SE in DEFER_SE_AND_SPLICE) and
  // `splitDeclarationAroundLiftedSE` (nested-proxy SE-prefix lift through a multi-decl)
  // re-wrap a VariableDeclaration in ExportNamedDeclaration when the original host was
  // exported. used by `tryFlattenNestedProxyDestructure` to keep each cascaded extraction
  // re-exporting its binding (`export const from = _Array$from;` instead of dropping the
  // `export` keyword on individual emitted declarations)
  function wrapAsExportIf(decl, isExport) {
    return isExport ? t.exportNamedDeclaration(decl) : decl;
  }

  function splitDeclarators(decls, kind, isExport) {
    if (!decls.length) return [];
    const groups = decls.some(d => t.isObjectPattern(d.id)) ? [decls] : decls.map(d => [d]);
    return groups.map(g => {
      // a receiver memo is an internal temp: standalone `const`, never export-wrapped
      if (g.length === 1 && memoDeclarators.has(g[0])) return t.variableDeclaration('const', g);
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
    declaration, declarator, extractedDeclarators, willRemoveDeclarator, declCount, isForInit,
  }) {
    if (!willRemoveDeclarator || declCount <= 1 || isForInit) return false;
    const idx = declaration.node.declarations.indexOf(declarator.node);
    if (idx === -1) return false;
    // descend a transparent array wrapper so a nested-element SE lifts too; the split drops
    // the consumed declarator outright, so no element swap is needed (unlike the single-decl
    // lift). non-wrapper inits fall back to the bare top-level prefix
    const { prefix } = descendArrayWrapperToSE(t, declarator.node)
      ?? peelNestedSequenceExpressions(declarator.node.init);
    splitDeclarationAtSlot({ declaration, idx, sePrefix: prefix, extractedDeclarators });
    return true;
  }

  // shared primitive: replace declaration with `[pre-siblings, ...SE expression
  // statements, extracted + post-siblings]`. `sePrefix` is an array of AST expression
  // nodes (empty for no-SE callers) - each cloned into a standalone ExpressionStatement
  // between the pre and post halves so sibling evaluation order survives. consumers:
  //   - `trySplitAroundConsumedDeclarator` (nested-proxy cascade, pre-peeled SE prefix)
  //   - `spliceAndLiftSideEffect` (DEFER_SE_AND_SPLICE, single-element SE array or empty)
  function splitDeclarationAtSlot({ declaration, idx, sePrefix, extractedDeclarators }) {
    const { kind } = declaration.node;
    const isExport = declaration.parentPath?.isExportNamedDeclaration();
    const decls = declaration.node.declarations;
    const stmts = [
      ...splitDeclarators(decls.slice(0, idx), kind, isExport),
      ...sePrefix.map(e => t.expressionStatement(t.cloneNode(e))),
      ...splitDeclarators([...extractedDeclarators, ...decls.slice(idx + 1)], kind, isExport),
    ];
    if (stmts.length) liftLeadingComments(declaration.node, stmts[0]);
    const newPaths = declaration.replaceWithMultiple(stmts);
    // re-mark grouped products for the post-traverse split drain: `splitDeclarators` keeps
    // ObjectPattern-bearing runs comma-joined so later per-prop visits still see an intact
    // multi-decl, and the replace killed the originally-marked path. the drain delivers the
    // final statement-per-declarator canon after those visits complete
    for (const p of newPaths) {
      const inner = p.isExportNamedDeclaration() ? p.get('declaration') : p;
      if (inner.isVariableDeclaration() && inner.node.declarations.length > 1) {
        flatTouchedMultiDecls.add(inner);
      }
    }
  }

  // DEFER_SE_AND_SPLICE strategy executor: lift the side-effecting init out of the
  // consumed slot and split declaration around it. SE init -> single trimmed expression
  // emitted between pre/post halves; no-SE init -> empty SE prefix (split still
  // preserves sibling order). earlier `deferSideEffect` anchored SE at original-
  // declaration body index, so after a strategy-time sibling shift, the lifted
  // SE landed BEFORE pre-siblings (observable when both halves carry effects)
  function spliceAndLiftSideEffect({ declaration, parent, localBinding, value }) {
    const idx = declaration.node.declarations.indexOf(parent.node);
    if (idx === -1) return;
    const sePrefix = mayHaveSideEffects(parent.node.init)
      ? [trimSideEffectTail(parent.node.init)]
      : [];
    splitDeclarationAtSlot({
      declaration, idx, sePrefix,
      extractedDeclarators: [t.variableDeclarator(localBinding, value)],
    });
  }

  // build the planner context for an AssignmentExpression destructure host. mirrors
  // `classifyVariableDeclaratorSite`: `assignmentTarget` is the host ExpressionStatement,
  // `isBodyless` reports whether that statement is the unbraced body of a control statement,
  // `hasSideEffects` is only relevant when the destructure pattern was fully consumed (isEmpty)
  function classifyAssignmentDestructureSite({ parent, assignmentTarget, isStaticValue, isEmpty }) {
    return {
      parentType: 'AssignmentExpression',
      isEmpty,
      isStaticValue,
      hasSideEffects: isEmpty && mayHaveSideEffects(parent.node.right),
      isBodyless: isBodylessStatementSlot(assignmentTarget.parentPath?.node, assignmentTarget.node),
    };
  }

  // AssignmentExpression branch executor. dispatches the planner strategy to the matching
  // AST mutation - parallel to `emitVariableDeclaratorDestructure`'s switch
  function emitAssignmentDestructure({ parent, localBinding, value, isStaticValue, isEmpty }) {
    const assignment = t.expressionStatement(t.assignmentExpression('=', localBinding, value));
    // peel Paren / TS wrappers up to the ExpressionStatement so the rewrite owns the whole
    // statement - replacing only the inner assignment leaves dead wrapper decoration
    // (`((from = _Array$from) satisfies unknown)!;`) the unplugin render never emits
    const assignmentTarget = peelParenAndTSParentPath(parent);
    // save the original body index before the first insertBefore shifts it, so a deferred SE on
    // the empty tail (`({ from, of } = (se(), Array))`) lifts AHEAD of the earlier insertBefore'd
    // assignments instead of interleaving between them - mirrors the VariableDeclarator capture,
    // aligning flat multi-prop AE with the VariableDeclaration splice order
    if (!originalDeclKeys.has(assignmentTarget.node)) {
      originalDeclKeys.set(assignmentTarget.node, findStatementParent(assignmentTarget).key);
    }
    const ctx = classifyAssignmentDestructureSite({ parent, assignmentTarget, isStaticValue, isEmpty });
    const strategy = planDestructureEmission(ctx);
    switch (strategy) {
      case STRATEGIES.WRAP_BODYLESS_SE_ASSIGN:
        return wrapBodylessAssignWithSideEffect({
          assignmentTarget, initNode: parent.node.right, assignment,
        });
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

  // AE counterpart of `wrapBodylessWithSideEffect`. simpler shape: the host is a single
  // ExpressionStatement with no sibling declarators, so the block is just `[<SE>; <assign>;]`.
  // `cloneDeep` for the same reason as the VariableDeclarator wrap: `initNode` is still
  // referenced by the about-to-be-replaced assignment expression
  function wrapBodylessAssignWithSideEffect({ assignmentTarget, initNode, assignment }) {
    assignmentTarget.replaceWith(t.blockStatement([
      t.expressionStatement(trimSideEffectTail(t.cloneDeep(initNode))),
      assignment,
    ]));
  }

  // post-traverse drain for the multi-decl split canon. statement-position only; a path
  // already replaced by another emission (bodyless block wrap, split-around) fails the
  // VariableDeclaration check and is skipped
  function splitFlatMultiDecls() {
    for (const declaration of flatTouchedMultiDecls) {
      if (!declaration.node || !declaration.parentPath || !declaration.isVariableDeclaration()) continue;
      const decls = declaration.node.declarations;
      if (!decls || decls.length <= 1) continue;
      // a TDZ-safe trailing declarator stays grouped with its predecessor
      const groups = [];
      for (const d of decls) {
        if (attachToPrevDeclarator.has(d) && groups.length) groups.at(-1).push(d);
        else groups.push([d]);
      }
      if (groups.length <= 1) continue;
      const isExport = declaration.parentPath.isExportNamedDeclaration();
      const target = isExport ? declaration.parentPath : declaration;
      const slotParent = target.parentPath?.node;
      const stmts = groups.map(g => g.length === 1 && memoDeclarators.has(g[0])
        ? t.variableDeclaration('const', g)
        : wrapAsExportIf(t.variableDeclaration(declaration.node.kind, g), isExport));
      liftLeadingComments(declaration.node, stmts[0]);
      // an unbraced control slot takes exactly one statement - block-wrap the splits there
      // (the unplugin canon); plain statement lists splice in place
      if (isBodylessStatementSlot(slotParent, target.node)) target.replaceWith(t.blockStatement(stmts));
      else if (Array.isArray(slotParent?.body) || Array.isArray(slotParent?.consequent)) target.replaceWithMultiple(stmts);
    }
    flatTouchedMultiDecls.clear();
  }

  return { deferredSideEffects, extractCatchClause, handleObjectPropertyResult, splitFlatMultiDecls, tryFlattenProxyHopHost };
}
