// destructure rewrite pipeline. covers parameter-default synth-swap, top-level
// VariableDeclaration extraction, catch-clause rewrite, per-branch fallback synth-swap, and
// the nested proxy-global flatten path (`const {Array:{from}} = globalThis` -> `const from
// = _Array$from`). factory captures closure deps from the outer transform context (code /
// scopeTracker / transforms / injector / Sets / resolver hooks + helpers from the
// PolyfillEmitter factory). pending-collection Maps for in-flight destructure / synth-swap
// rewrites live in factory closure (drained post-traverse via the public methods).
// public surface: `applyDestructuringTransforms`, `applySynthSwaps`, `handleDestructuringPure`,
// `canFullyConsumeProxyDeclarator` (pre-pass speculation)
import {
  destructureReceiverSlot,
  getFallbackBranchSlots,
  isFunctionParamDestructureParent,
  isIdentifierPropValue,
  isSynthSimpleObjectPattern,
  mayHaveSideEffects,
  objectPatternPropNeedsReceiverRewrite,
  peelFallbackWrappers,
  peelNestedSequenceExpressions,
  propBindingIdentifier,
  TS_EXPR_WRAPPERS,
  unwrapInitValue,
  unwrapParens,
  walkPatternIdentifiers,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { POSSIBLE_GLOBAL_OBJECTS, globalProxyMemberName } from '@core-js/polyfill-provider/helpers/class-walk';
import { resolve as resolveBuiltIn } from '@core-js/polyfill-provider';
import { findProxyGlobal, resolveObjectName as sharedResolveObjectName } from '@core-js/polyfill-provider/detect-usage/resolve';
import { isViableBranchForKey } from '@core-js/polyfill-provider/detect-usage/destructure';
import { classifyVariableDeclarationHost } from '@core-js/polyfill-provider/destructure-host-shape';
import {
  canTransformDestructuring,
  findSynthSwapReceiver,
  walkUpNestedDestructureToAssignment,
  walkUpNestedDestructureToDeclaration,
} from './destructure-emit-utils.js';
import { walkAstNodes } from './plugin-helpers.js';

export function createDestructureEmitter({
  estreeAdapter,
  injectPureImport,
  injector,
  isBodylessStatementBody,
  nodeSrc,
  resolveGlobalPolyfill,
  resolvePure,
  scopeTracker,
  skippedNodes,
  transforms,
}) {
  // ---------- pending collections (drained post-traverse) ----------

  // ObjectPattern node -> { entries, allProps, declPath, declaratorPath, ... }. populated
  // by `handleDestructuringPure` as the visitor walks; drained by `applyDestructuringTransforms`
  // after traverse completes (full polyfill set per pattern known only after sibling visits)
  const pendingDestructuring = new Map();
  // receiver -> `{p: _polyfill, q: R.q, ...}` synth swaps. two detection shapes feed this map:
  //   - param-default `function({p} = R)`: receiver = AssignmentPattern.right
  //   - IIFE `(({p}) => body)(R)`: receiver = CallExpression.arguments[i]
  // entry shape: `{ receiver, objectPattern, polyfills: Map<key, binding> }`
  const pendingSynthSwaps = new Map();

  // ---------- nested proxy-global flatten ----------

  // pre-pass walks every declarator for `canFullyConsumeProxyDeclarator`; main pass walks
  // the same declarators again via `tryFlattenNestedProxy`. cache by node identity to avoid
  // double work - amortizes the double traverse to one logical plan per declarator (O(1)
  // lookup on the second visit instead of re-scanning every property)
  const planCache = new WeakMap();
  // tracks declarations already rewritten by `tryFlattenNestedProxy` so the visitor's
  // re-entry on every property of a flattened decl is a no-op idempotent
  const flattenedNestedDecls = new WeakSet();

  // `({Array: {from}} = receiver);` (AssignmentExpression in ExpressionStatement) -
  // value is discarded, replace whole statement with `from = _polyfill;` so polyfill
  // always wins. SE prefix in receiver lifts as separate statement. matches babel-plugin's
  // `flattenAssignmentExpressionDestructure`
  function tryFlattenAssignmentExpression(metaPath, meta) {
    const valueNode = propBindingIdentifier(metaPath.node.value);
    if (!valueNode) return false;
    const assignPath = walkUpNestedDestructureToAssignment(metaPath.parentPath);
    const assignNode = assignPath?.node;
    if (!assignNode || assignNode.operator !== '=') return false;
    // peel oxc's preserved `({...} = G)` parens to reach the ExpressionStatement above
    let stmtPath = assignPath.parentPath;
    while (stmtPath?.node?.type === 'ParenthesizedExpression') stmtPath = stmtPath.parentPath;
    if (stmtPath?.node?.type !== 'ExpressionStatement') return false;
    const stmtNode = stmtPath.node;
    const pure = resolvePure(meta);
    if (!pure || pure.kind === 'instance') return false;
    const binding = injectPureImport(pure.entry, pure.hintName);
    // shared `peelNestedSequenceExpressions` lifts every SE layer's preceding effects
    // through paren wrappers (`(se1(), (se2(), G))` -> `[se1(), se2()]`); without
    // recursion, only outermost se1() lifts and inner se2() silently elides
    const { prefix: seExprs, tail: receiverTail } = peelNestedSequenceExpressions(assignNode.right);
    const prefix = seExprs.length ? `${ seExprs.map(nodeSrc).join(', ') };\n` : '';
    // seed skippedNodes ONLY for consumed parts: LHS pattern (extracted into `valueNode = id`)
    // and the receiver's consumed tail (last expression of SE chain). SE-prefix Identifiers
    // (e.g. `Promise` in `(Promise.resolve(0).then(noop), globalThis)`) need natural visitor
    // pass to emit their own polyfill imports. mirrors `seedSkippedForExtractedDeclarators`
    // logic for the VariableDeclaration shape - blanket walking `assignNode` would suppress
    // those imports
    walkAstNodes(assignNode.left, node => skippedNodes.add(node));
    if (receiverTail) walkAstNodes(receiverTail, node => skippedNodes.add(node));
    transforms.add(stmtNode.start, stmtNode.end, `${ prefix }${ valueNode.name } = ${ binding };`);
    return true;
  }

  function tryFlattenNestedProxy(metaPath) {
    // accept `{ from }` / `{ from: alias }` / `{ from = default }` / `{ from: alias = default }`.
    // user's default is dropped since the extracted polyfill is always defined (see `planInnerProp`)
    if (!propBindingIdentifier(metaPath.node.value)) return false;
    const declPath = walkUpNestedDestructureToDeclaration(metaPath.parentPath);
    const declaration = declPath?.node;
    if (declaration?.type !== 'VariableDeclaration') return false;
    if (flattenedNestedDecls.has(declaration)) return true;
    const parentNode = declPath.parentPath?.node;
    const isForInit = parentNode?.type === 'ForStatement' && parentNode.init === declaration;
    const initOf = i => {
      let n = declaration.declarations[i].init;
      if (n?.type === 'ParenthesizedExpression') n = n.expression;
      return n;
    };
    // for-init with SE init can't host a prefix statement outside the loop header.
    // bail before `rewriteDeclarator` runs - it would inject pure imports
    // that then go unused when we can't emit the flatten replacement
    if (isForInit) {
      for (let i = 0; i < declaration.declarations.length; i++) {
        if (initOf(i)?.type === 'SequenceExpression') return false;
      }
    }
    const perDecl = declaration.declarations.map(d => rewriteDeclarator(d, metaPath.scope));
    if (!perDecl.some(r => r.extractions.length)) return false;
    flattenedNestedDecls.add(declaration);
    seedSkippedForExtractedDeclarators(declaration, perDecl);
    let replacement = renderFlattened(perDecl, declaration.kind, isForInit);
    if (!isForInit) {
      // lift SE prefix ONLY from extracted declarators (whose receiver tail was consumed
      // by the flatten rewrite). non-extracted siblings keep their original source verbatim
      // through `polyfillSiblingReceiverRefs` / `nodeSrc` - lifting their SE prefix would
      // duplicate execution: once via the lifted statement, once via the preserved declarator
      const sequencePrefixes = [];
      for (let index = 0; index < declaration.declarations.length; index++) {
        if (!perDecl[index].extractions.length) continue;
        const { prefix: sequenceExpressions } = peelNestedSequenceExpressions(declaration.declarations[index].init);
        if (sequenceExpressions.length) sequencePrefixes.push(sequenceExpressions.map(nodeSrc).join(', '));
      }
      if (sequencePrefixes.length) replacement = `${ sequencePrefixes.map(prefix => `${ prefix };`).join('\n') }\n${ replacement }`;
    }
    transforms.add(declaration.start, declaration.end, replacement);
    return true;
  }

  // seed skippedNodes ONLY for the consumed parts: the ObjectPattern (id) and the
  // receiver tail (last expr of SE init). SE-prefix expressions are preserved as
  // source text via `sePrefixes` in tryFlattenNestedProxy - their inner Identifiers
  // (e.g. `Promise` in `(Promise.resolve(...).then(noop), globalThis)`) need natural
  // visitor pass to emit their own polyfill imports. seeding the whole declarator
  // would block them. siblings reusing a flattened receiver's name
  // (`{X:{m}}=globalThis, y=globalThis`) get inline substitution via
  // `polyfillSiblingReceiverRefs` so compose's nth-count matches the flattened source
  function seedSkippedForExtractedDeclarators(declaration, perDecl) {
    const flattenedReceivers = new Set();
    for (let i = 0; i < perDecl.length; i++) {
      if (!perDecl[i].extractions.length) continue;
      const decl = declaration.declarations[i];
      walkAstNodes(decl.id, n => skippedNodes.add(n));
      let initInner = decl.init;
      while (initInner?.type === 'ParenthesizedExpression') initInner = initInner.expression;
      const consumedTail = initInner?.type === 'SequenceExpression' ? initInner.expressions.at(-1) : initInner;
      if (consumedTail) walkAstNodes(consumedTail, n => skippedNodes.add(n));
      if (perDecl[i].receiver) flattenedReceivers.add(perDecl[i].receiver);
    }
    if (flattenedReceivers.size) {
      for (let i = 0; i < perDecl.length; i++) {
        if (!perDecl[i].extractions.length) {
          perDecl[i].preservedSrc = polyfillSiblingReceiverRefs(declaration.declarations[i], flattenedReceivers);
        }
      }
    }
  }

  // for-init: single `kind d1, d2, d3` - `\n`-separated statements parse as for-init-test-
  // update with the middle declaration as test, a syntax error.
  // block-level: extractions split to separate statements (match babel), preserved
  // declarators collapse into one trailing `kind` statement
  function renderFlattened(perDecl, kind, isForInit) {
    if (isForInit) {
      const parts = [];
      for (const r of perDecl) {
        for (const e of r.extractions) parts.push(e.decl);
        if (r.preservedSrc !== null) parts.push(r.preservedSrc);
      }
      return `${ kind } ${ parts.join(', ') }`;
    }
    const extractedLines = perDecl.flatMap(r => r.extractions.map(e => `${ kind } ${ e.decl };`));
    const preservedDecls = perDecl.map(r => r.preservedSrc).filter(s => s !== null);
    return extractedLines.join('\n')
      + (preservedDecls.length ? `\n${ kind } ${ preservedDecls.join(', ') };` : '');
  }

  // plan factory: classify every outer prop of a proxy-global declarator without
  // side effects. returned shape:
  //   { receiver, outerProps: [{ extractions?, preservedSrc }] }
  // preservedSrc === null -> outer prop was fully consumed (drop).
  // null when the init isn't a proxy-global ObjectPattern source or nothing matches
  function planDeclarator(declarator, scope) {
    if (planCache.has(declarator)) return planCache.get(declarator);
    let plan = null;
    if (declarator.id?.type === 'ObjectPattern' && declarator.id.properties.length) {
      // `(se(), globalThis)` - unwrap to the semantic init value so nested receivers
      // resolve through SequenceExpression prefixes + preserved parens. parity with
      // non-nested destructure which goes through `buildDestructuringInitMeta`
      const init = unwrapInitValue(declarator.init);
      const receiver = init ? sharedResolveObjectName(init, scope, estreeAdapter) : null;
      if (receiver && POSSIBLE_GLOBAL_OBJECTS.has(receiver)) {
        const outerProps = declarator.id.properties.map(planOuterProp);
        if (outerProps.some(p => p.extractions?.length)) plan = { receiver, outerProps };
      }
    }
    planCache.set(declarator, plan);
    return plan;
  }

  // proxy-global outer prop: four shapes
  //   - `{ Foo: { bar, ... } }` where Foo is a real global - inner pattern holds static methods
  //   - `{ Self: { ... } }` where Self is itself a proxy-global - alias hop, recurse keeping
  //     the chain transparent. enables N-level nests like `{ self: { window: { Array: { from } } } } = globalThis`
  //   - `{ Foo }` shorthand - polyfill Foo as a global
  //   - `{ Foo: alias }` aliased - same, different local name
  function planOuterProp(outerProp) {
    if (outerProp.type !== 'Property' || outerProp.computed
      || outerProp.key?.type !== 'Identifier') {
      return { preservedSrc: nodeSrc(outerProp) };
    }
    const { name } = outerProp.key;
    if (outerProp.value?.type === 'ObjectPattern') {
      const planChild = POSSIBLE_GLOBAL_OBJECTS.has(name)
        ? planOuterProp
        : innerProp => planInnerProp(innerProp, name);
      return foldNestedPattern(outerProp, planChild);
    }
    if (outerProp.value?.type === 'Identifier') {
      const pure = resolveGlobalPolyfill(name);
      if (!pure) return { preservedSrc: nodeSrc(outerProp) };
      return {
        extractions: [{ entry: pure.entry, hint: pure.hintName, localName: outerProp.value.name }],
        preservedSrc: null,
      };
    }
    return { preservedSrc: nodeSrc(outerProp) };
  }

  // fold an ObjectPattern-valued outer prop: plan each child, concat extractions,
  // rebuild preserved shape. empty extractions -> bail as opaque; all consumed -> null
  // preservedSrc (caller drops the prop); partial -> `name: { a, b }` with survivors
  function foldNestedPattern(outerProp, planChild) {
    const extractions = [];
    const preservedInner = [];
    for (const child of outerProp.value.properties) {
      const e = planChild(child);
      if (e.extractions?.length) extractions.push(...e.extractions);
      if (e.preservedSrc !== null && e.preservedSrc !== undefined) preservedInner.push(e.preservedSrc);
    }
    if (!extractions.length) return { preservedSrc: nodeSrc(outerProp) };
    if (!preservedInner.length) return { extractions, preservedSrc: null };
    return { extractions, preservedSrc: `${ outerProp.key.name }: { ${ preservedInner.join(', ') } }` };
  }

  // inner prop (static method on the nested global): `{ Array: { from } }` - `from` on
  // `Array`. only simple Identifier values; rest / default / non-Identifier / unknown
  // keys fall back to `preservedSrc`. uses the bare `resolveBuiltIn` meta resolver first
  // to filter instance kind - `resolvePure` with no path would crash on `enhanceMeta`'s
  // `isMemberLike(path)` for instance resolutions
  function planInnerProp(prop, receiverName) {
    if (prop.type !== 'Property' || prop.computed
      || prop.key?.type !== 'Identifier') {
      return { preservedSrc: nodeSrc(prop) };
    }
    // accept `{ from }`, `{ from: alias }`, `{ from = default }`, `{ from: alias = default }`.
    // user's default is dropped: polyfill is always defined, the user's default would be
    // dead code (fires only on undefined property, which polyfill rules out)
    const valueNode = propBindingIdentifier(prop.value);
    if (!valueNode) return { preservedSrc: nodeSrc(prop) };
    const meta = { kind: 'property', object: receiverName, key: prop.key.name, placement: 'static' };
    if (resolveBuiltIn(meta)?.kind === 'instance') return { preservedSrc: nodeSrc(prop) };
    const pure = resolvePure(meta);
    if (!pure || pure.kind === 'instance') return { preservedSrc: nodeSrc(prop) };
    return {
      extractions: [{ entry: pure.entry, hint: pure.hintName, localName: valueNode.name }],
      preservedSrc: null,
    };
  }

  // execute the plan: inject polyfill imports, emit extractions. returns
  // `{ extractions: [{ decl }], preservedSrc }` where `preservedSrc` is null when the
  // declarator is fully consumed, raw src when there's no plan to touch, or a rebuilt
  // `{ ... } = init` source when outer siblings remain
  function rewriteDeclarator(declarator, scope) {
    const plan = planDeclarator(declarator, scope);
    if (!plan) return { extractions: [], preservedSrc: nodeSrc(declarator), receiver: null };
    const extractions = [];
    const preservedOuter = [];
    // RestElement in outer pattern - rest gathers all OTHER own keys, so dropping a
    // fully-consumed key from `{Array: {from}, ...rest} = globalThis` would change
    // runtime semantics (`rest.Array` becomes defined, original excluded it). keep
    // a `Foo: _unused` sentinel for each consumed key when rest is present
    const hasRest = declarator.id.properties.some(p => p.type === 'RestElement');
    for (let i = 0; i < plan.outerProps.length; i++) {
      const outer = plan.outerProps[i];
      for (const e of outer.extractions ?? []) {
        const binding = injectPureImport(e.entry, e.hint);
        extractions.push({ decl: `${ e.localName } = ${ binding }` });
      }
      if (outer.preservedSrc !== null) {
        preservedOuter.push(outer.preservedSrc);
      } else if (hasRest) {
        const sourceProp = declarator.id.properties[i];
        const keyName = sourceProp?.key?.name;
        if (keyName) preservedOuter.push(`${ keyName }: ${ injector.generateUnusedName() }`);
      }
    }
    if (!preservedOuter.length) return { extractions, preservedSrc: null, receiver: plan.receiver };
    // partial flatten: preserved declarator still destructures from the receiver,
    // so polyfill it - old runtimes without `globalThis` / `self` would crash otherwise
    const receiverPure = resolveGlobalPolyfill(plan.receiver);
    const initSrc = receiverPure
      ? injectPureImport(receiverPure.entry, receiverPure.hintName)
      : nodeSrc(declarator.init);
    return {
      extractions,
      preservedSrc: `{ ${ preservedOuter.join(', ') } } = ${ initSrc }`,
      receiver: plan.receiver,
    };
  }

  // pre-pass helper: true when every outer prop was fully consumed - flatten will
  // discard the declarator's init, so `_globalThis` injection can be suppressed
  function canFullyConsumeProxyDeclarator(d, scope) {
    const plan = planDeclarator(d, scope);
    return !!plan && plan.outerProps.every(p => p.preservedSrc === null);
  }

  // sibling-side companion of `rewriteDeclarator` for multi-decl flatten.
  // walks a preserved-only declarator for Identifiers matching any flattened receiver name,
  // substitutes them with their polyfill binding directly in the rendered source, and seeds
  // skippedNodes so identifier visitor doesn't queue a parallel transform that would mismatch
  // TransformQueue's nth-count compose
  function polyfillSiblingReceiverRefs(declarator, flattenedReceivers) {
    // collect Identifier matches with shadowing + parent-MemberExpression filtering. two
    // skip rules:
    //   (1) parent MemberExpression resolves to a polyfillable global (`globalThis.Map`,
    //       `globalThis['Map']`). the outer MemberExpression transform replaces the whole
    //       `globalThis.Map` range with `_Map`; a competing inline `globalThis -> _globalThis`
    //       would land a `_globalThis.Map` substring INSIDE the outer's `_Map` content during
    //       compose, turning the inner needle search into a partial match (`__Map` corruption).
    //       both non-computed `obj.Map` and computed-string `obj['Map']` shapes apply
    //   (2) Identifier shadowed by a function-like ancestor inside the declarator (param /
    //       function name). the local binding shadows the outer global at runtime, so
    //       rewriting the inner reference to a polyfill import would change semantics
    //       (`function (globalThis) { return globalThis }` returns the param value, not `_globalThis`)
    const matches = [];
    const scopeStack = [];

    function pushFunctionScope(node) {
      const locals = new Set();
      for (const param of node.params ?? []) {
        walkPatternIdentifiers(param, id => locals.add(id.name));
      }
      // FunctionExpression / FunctionDeclaration's own name is in scope inside the body
      if (node.id?.name) locals.add(node.id.name);
      scopeStack.push(locals);
    }

    function isShadowed(name) {
      for (const scope of scopeStack) if (scope.has(name)) return true;
      return false;
    }

    function isPolyfillableMemberAccess(parent, identifierNode) {
      if (parent?.type !== 'MemberExpression' || parent.object !== identifierNode) return false;
      const { property } = parent;
      if (!parent.computed) {
        return property?.type === 'Identifier' && !!resolveGlobalPolyfill(property.name);
      }
      // computed-string `obj['Map']`: parser shape varies (babel StringLiteral / oxc Literal
      // with string .value). both must apply the same skip - the outer rewrite's range
      // covers the whole `obj['Map']` MemberExpression
      const literalValue = property?.type === 'StringLiteral' ? property.value
        : property?.type === 'Literal' && typeof property.value === 'string' ? property.value
          : null;
      return literalValue !== null && !!resolveGlobalPolyfill(literalValue);
    }

    function walk(node, parent) {
      if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
      const opensScope = node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration'
        || node.type === 'ArrowFunctionExpression' || node.type === 'ObjectMethod' || node.type === 'ClassMethod';
      if (opensScope) pushFunctionScope(node);
      if (node.type === 'Identifier' && flattenedReceivers.has(node.name)
        && !isShadowed(node.name) && !isPolyfillableMemberAccess(parent, node)) {
        matches.push(node);
      }
      for (const key of Object.keys(node)) {
        const value = node[key];
        if (Array.isArray(value)) for (const item of value) walk(item, node);
        else walk(value, node);
      }
      if (opensScope) scopeStack.pop();
    }

    walk(declarator, null);
    if (!matches.length) return nodeSrc(declarator);
    // descending source order so prior substitutions don't shift later relative indices
    matches.sort((leftMatch, rightMatch) => rightMatch.start - leftMatch.start);
    const declStart = declarator.start;
    let src = nodeSrc(declarator);
    for (const match of matches) {
      const pure = resolveGlobalPolyfill(match.name);
      if (!pure) continue;
      skippedNodes.add(match);
      src = src.slice(0, match.start - declStart)
        + injectPureImport(pure.entry, pure.hintName)
        + src.slice(match.end - declStart);
    }
    return src;
  }

  // ---------- destructure rewrite pipeline ----------

  // top-level destructure path (`const {from} = cond ? Array : Set`, assignment-target).
  // resolves the wrapper's RHS slot per parent shape, then delegates to the shared
  // per-branch helper. wraps to keep `handleDestructuringPure` under the lint statement-cap
  function tryFromFallbackPerBranchSynth(metaPath, propNode) {
    const wrapperNode = metaPath.parentPath?.parentPath?.node;
    const slot = destructureReceiverSlot(wrapperNode);
    if (!slot) return;
    tryRegisterPerBranchSynth(wrapperNode[slot], propNode, metaPath.parent, metaPath.scope);
  }

  // ConditionalExpression / LogicalExpression in destructure-receiver position
  // (`= cond ? Array : Set` / `= Array || Set`). `meta.fromFallback` flags this case -
  // the resolved meta tracks ONE branch but runtime picks per-call. for branches
  // statically resolvable to a known global with a viable static polyfill for the
  // destructured key, register a per-branch synth-swap so each branch becomes its own
  // `{key: _Branch$key, ...}` literal. branches without viable polyfill are left raw -
  // the constructor identifier visitor still emits `_Set` etc. for shadow-correct globals.
  // returns true when at least one branch was registered
  function tryRegisterPerBranchSynth(rhs, propNode, objectPattern, scope) {
    if (!rhs || !propNode || !objectPattern) return false;
    if (!isSynthSimpleObjectPattern(objectPattern)) return false;
    if (propNode.computed || propNode.key?.type !== 'Identifier') return false;
    // peel ParenthesizedExpression + TS expression wrappers so paren-wrapped or TS-cast
    // fallback receivers (`(cond ? A : B) as any`) reach the slot resolver. NOTE: do NOT
    // peel chain-assignment here - `foo = cond ? Array : Set` is intentional escape hatch
    // (rewriting branches as synth literals would change `foo`'s runtime value)
    const inner = peelFallbackWrappers(rhs);
    const slots = getFallbackBranchSlots(inner);
    if (!slots) return false;
    const key = propNode.key.name;
    let registered = false;
    for (const slot of slots) {
      const branch = inner[slot];
      const pure = isViableBranchForKey(branch, key, scope, estreeAdapter, resolvePure);
      if (!pure) continue;
      const binding = injectPureImport(pure.entry, pure.hintName);
      // skip both the wrapper (ParenthesizedExpression / TS expression) AND the inner
      // Identifier - otherwise the inner Identifier visitor fires on `Iterator` and emits
      // a parallel constructor polyfill (`_Iterator`) that conflicts with the synth-swap
      // emit (`{from: _Iterator$from}`)
      let cur = branch;
      while (cur) {
        skippedNodes.add(cur);
        if (cur.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(cur.type)) cur = cur.expression;
        else break;
      }
      let pending = pendingSynthSwaps.get(branch);
      if (!pending) {
        pending = { receiver: branch, objectPattern, polyfills: new Map() };
        pendingSynthSwaps.set(branch, pending);
      }
      pending.polyfills.set(key, binding);
      registered = true;
    }
    return registered;
  }

  // parameter destructure. synth-swap when `findSynthSwapReceiver` identifies a safe
  // Identifier receiver; otherwise inline-default `{p = _polyfill}`.
  // AssignmentPattern value (`{from = []}`): accept and polyfill via synth-swap - the
  // user's default becomes dead code because synth-polyfilled property is always defined
  function handleParameterDestructurePure(meta, metaPath, propNode) {
    const { value } = propNode;
    if (!isIdentifierPropValue(value)) return;
    if (meta.fromFallback) {
      const wrapperNode = metaPath.parentPath?.parentPath?.node;
      const slot = destructureReceiverSlot(wrapperNode);
      if (slot) tryRegisterPerBranchSynth(wrapperNode[slot], propNode, metaPath.parent, metaPath.scope);
      return;
    }
    const isAssign = value.type === 'AssignmentPattern';
    const pureResult = resolvePure(meta, metaPath);
    if (!pureResult || pureResult.kind === 'instance') return;
    const binding = injectPureImport(pureResult.entry, pureResult.hintName);
    const objectPattern = metaPath.parent;
    const receiver = isSynthSimpleObjectPattern(objectPattern)
      ? findSynthSwapReceiver(metaPath.parentPath?.parentPath, objectPattern) : null;
    if (!receiver) {
      if (isAssign) transforms.add(value.right.start, value.right.end, binding);
      else transforms.insert(value.end, ` = ${ binding }`);
      return;
    }
    // synth-swap owns the receiver - identifier visitor would race on the same range
    skippedNodes.add(receiver);
    let pending = pendingSynthSwaps.get(receiver);
    if (!pending) {
      pending = { receiver, objectPattern, polyfills: new Map() };
      pendingSynthSwaps.set(receiver, pending);
    }
    pending.polyfills.set(propNode.key.name, binding);
  }

  // Symbol.iterator handling is split across `handleSymbolIterator` (member-call form),
  // this fn (property-destructure form `{ [Symbol.iterator]: it } = obj`), and the catch
  // emit loop. unification would require a unified meta shape across the three call sites,
  // not currently warranted - each call site has different bound/unbound receiver semantics
  function handleDestructuringPure(meta, metaPath, propNode) {
    if (isFunctionParamDestructureParent(metaPath.parentPath)) {
      return handleParameterDestructurePure(meta, metaPath, propNode);
    }
    if (metaPath.parentPath?.parentPath?.node?.type === 'Property') {
      if (tryFlattenNestedProxy(metaPath)) return;
      if (tryFlattenAssignmentExpression(metaPath, meta)) return;
      return handleParameterDestructurePure(meta, metaPath, propNode);
    }
    if (propNode.value?.type === 'Identifier'
        && injector.hasGeneratedUnusedName(propNode.value.name)) return;
    if (!canTransformDestructuring(metaPath)) return;
    if (meta.fromFallback) return tryFromFallbackPerBranchSynth(metaPath, propNode);
    const patternHasRest = metaPath.parent?.properties?.some(
      p => p.type === 'RestElement' || p.type === 'SpreadElement');
    if (patternHasRest && metaPath.parentPath?.parentPath?.parentPath?.parentPath?.node?.type
        === 'ExportNamedDeclaration') return;
    if (propNode.computed && meta.key === 'Symbol.iterator') {
      const patternProps = metaPath.parent?.properties;
      const hasRest = patternProps?.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
      if (!hasRest) {
        skippedNodes.add(propNode.key);
        if (propNode.key.object) skippedNodes.add(propNode.key.object);
      }
    }
    const { value } = propNode;
    if (value && !propBindingIdentifier(value)) return;
    const isSymbolIterator = propNode.computed && meta.key === 'Symbol.iterator';
    const pureResult = isSymbolIterator ? null : resolvePure(meta, metaPath);
    if (!pureResult && !isSymbolIterator) return;

    const objectPattern = metaPath.parent;
    const isDefault = value?.type === 'AssignmentPattern';
    const localName = isDefault ? value.left.name : value?.name;
    const defaultSrc = isDefault ? nodeSrc(value.right) : null;
    if (!localName) return;

    const declaratorPath = metaPath.parentPath?.parentPath;
    const isCatchClause = declaratorPath?.node?.type === 'CatchClause';
    if (isCatchClause && !objectPatternPropNeedsReceiverRewrite(propNode)
        && !objectPattern.properties.some(p => p.type === 'RestElement')) {
      let referenced = false;
      walkAstNodes(declaratorPath.node.body, n => {
        if (!referenced && n.type === 'Identifier' && n.name === localName) referenced = true;
      });
      if (!referenced) return;
    }
    const kind = isSymbolIterator ? 'instance' : pureResult.kind;
    const binding = isSymbolIterator
        ? injectPureImport('get-iterator-method', 'getIteratorMethod')
        : injectPureImport(pureResult.entry, pureResult.hintName);
    const isAssignment = !isCatchClause && declaratorPath?.node?.type === 'AssignmentExpression';
    let declPath = isCatchClause ? declaratorPath : declaratorPath?.parentPath;
    if (isAssignment) {
      while (declPath?.node?.type === 'ParenthesizedExpression') declPath = declPath.parentPath;
    }
    const initNode = isCatchClause ? null
        : isAssignment ? declaratorPath?.node?.right : declaratorPath?.node?.init;

    if (!pendingDestructuring.has(objectPattern)) {
      const initSrc = isCatchClause ? injector.generateLocalRef() : initNode ? nodeSrc(initNode) : null;
      pendingDestructuring.set(objectPattern, {
        entries: [],
        allProps: objectPattern.properties || [],
        declPath,
        declaratorPath,
        isAssignment,
        isCatchClause,
        initSrc,
        initStart: initNode?.start,
        initEnd: initNode?.end,
        initNode,
        initIdentName: unwrapParens(initNode)?.type === 'Identifier' ? unwrapParens(initNode).name : null,
        scopeSnapshot: { scope: scopeTracker.scope, arrow: scopeTracker.arrow },
      });
      // mark globals in init so they don't generate conflicting transforms; instance
      // methods compose correctly and stay polyfilled (init expression remains as arg)
      if (initNode && !mayHaveSideEffects(initNode)) markInitGlobals(initNode);
    }
    pendingDestructuring.get(objectPattern).entries.push({ propNode, localName, binding, kind, defaultSrc });
  }

  // walk init expression marking proxy-global member chains and bare identifiers as
  // skipped, so identifier-visitor polyfill emits don't duplicate destructure rewrite.
  // logical/sequence/conditional branches walked recursively; instance methods on init
  // (arr.slice) intentionally unmarked - they compose correctly with destructure
  function markInitGlobals(node) {
    let cur = node;
    while (cur) {
      switch (cur.type) {
        case 'LogicalExpression':
          markInitGlobals(cur.left);
          cur = cur.right;
          break;
        case 'SequenceExpression':
          for (const expr of cur.expressions) markInitGlobals(expr);
          cur = null;
          break;
        case 'ConditionalExpression':
          markInitGlobals(cur.consequent);
          cur = cur.alternate;
          break;
        case 'ParenthesizedExpression':
        case 'ChainExpression':
          cur = cur.expression;
          break;
        case 'CallExpression':
        case 'OptionalCallExpression':
        case 'NewExpression':
        case 'TaggedTemplateExpression':
          cur = cur.callee || cur.tag;
          break;
        case 'MemberExpression':
        case 'OptionalMemberExpression':
          if (findProxyGlobal(cur)) skippedNodes.add(cur);
          cur = cur.object;
          break;
        case 'Identifier':
          skippedNodes.add(cur);
          cur = null;
          break;
        default:
          cur = TS_EXPR_WRAPPERS.has(cur.type) ? cur.expression : null;
      }
    }
  }

  // catch clause: replace param with ref, insert polyfilled + remaining in source order.
  // computed keys must have their pending polyfill rewrites extracted upfront - the catch
  // param overwrite below would otherwise contain orphan inner transforms -> compose throws
  // "could not locate inner needle". covers entry keys (Symbol.iterator absorbed by
  // getIteratorMethod) and non-entry siblings (Symbol.asyncIterator polyfilled by standalone
  // visitor) uniformly
  function emitCatchClause(infos, catchNode) {
    const [{ initSrc: ref, allProps }] = infos;
    const entryByProp = new Map(infos.flatMap(i => i.entries.map(e => [e.propNode, e])));
    const computedKeyContent = new Map();
    for (const p of allProps) {
      if (p.type !== 'Property' || !p.computed) continue;
      const content = transforms.extractContent(p.key.start, p.key.end);
      if (content !== null) computedKeyContent.set(p, content);
    }
    for (const e of entryByProp.values()) {
      if (e.propNode.computed) e.polyfillKeyContent = computedKeyContent.get(e.propNode) ?? null;
    }
    // non-entry prop source: use polyfilled key when extracted, else original slice.
    // shared between no-rest prelude and hasRest pattern rebuild
    const nonEntryPropSrc = p => {
      const polyfilledKey = computedKeyContent.get(p);
      return polyfilledKey === undefined
        ? nodeSrc(p)
        : `[${ polyfilledKey }]: ${ nodeSrc(p.value) }`;
    };
    const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
    const lines = [];
    for (const p of allProps) {
      if (p.type === 'RestElement' || p.type === 'SpreadElement') continue;
      const e = entryByProp.get(p);
      if (!e) {
        if (!hasRest) lines.push(`let { ${ nonEntryPropSrc(p) } } = ${ ref };`);
        continue;
      }
      const valueSrc = e.kind === 'instance' ? `${ e.binding }(${ ref })` : e.binding;
      if (e.defaultSrc) {
        const testRef = e.kind === 'instance' ? injector.generateLocalRef() : null;
        const test = testRef ? `(${ testRef } = ${ valueSrc })` : valueSrc;
        lines.push(`let ${ testRef ? `${ testRef }, ` : '' }${ e.localName } = ${ test } === void 0 ? ${ e.defaultSrc } : ${ testRef || valueSrc };`);
      } else {
        lines.push(`let ${ e.localName } = ${ valueSrc };`);
      }
    }
    if (hasRest) {
      const rebuiltProps = allProps.map(p => {
        const e = entryByProp.get(p);
        if (!e) return nonEntryPropSrc(p);
        const keySrc = e.polyfillKeyContent ? `[${ e.polyfillKeyContent }]` : nodeSrc(p.key);
        return `${ keySrc }: ${ injector.generateUnusedName() }`;
      });
      lines.push(`let { ${ rebuiltProps.join(', ') } } = ${ ref };`);
    }
    transforms.add(catchNode.param.start, catchNode.param.end, ref);
    transforms.insert(catchNode.body.start + 1, `\n${ lines.join('\n') }`);
  }

  // post-traverse: emit `{p: _polyfill, q: R.q, ...}` over the receiver span. runs
  // after main traverse - full polyfill set per receiver known only after sibling visits.
  // non-polyfilled siblings read from pure receiver when receiver itself is polyfillable
  // (raw `Promise.custom` on IE11 would ReferenceError before the destructure runs).
  // partial-rewrite risk: an exception inside the loop leaves `pendingSynthSwaps` half-applied
  // (some transforms queued, others lost). recovery semantics intentional: catch-and-continue
  // would silently produce inconsistent output, hard fail surfaces the bug to the user
  function applySynthSwaps() {
    for (const [, { receiver, objectPattern, polyfills }] of pendingSynthSwaps) {
      if (objectPattern?.type !== 'ObjectPattern') continue;
      const inner = peelFallbackWrappers(receiver);
      if (inner?.type !== 'Identifier') continue;
      const receiverPure = resolveGlobalPolyfill(inner.name);
      let receiverSrc = null;
      const getReceiverSrc = () => receiverSrc ??= receiverPure
        ? injectPureImport(receiverPure.entry, receiverPure.hintName)
        : inner.name;
      const entries = [];
      for (const p of objectPattern.properties) {
        if (p.type !== 'Property' || p.computed || p.key?.type !== 'Identifier') continue;
        const polyfill = polyfills.get(p.key.name);
        entries.push(polyfill
          ? `${ p.key.name }: ${ polyfill }`
          : `${ p.key.name }: ${ getReceiverSrc() }.${ p.key.name }`);
      }
      transforms.add(receiver.start, receiver.end, `{ ${ entries.join(', ') } }`);
    }
  }

  // three drain shapes routing through the single TransformQueue (overwrites + inserts):
  //   1. `applyDestructuringTransforms` - VariableDeclaration rewrite (splits, reorders, extracts)
  //   2. `applySynthSwaps` - function param default synth-swap (receiver-span overwrite)
  //   3. `emitCatchClause` - catch-pattern rewrite (param overwrite + body-prelude insert)
  // share `pendingDestructuring` / `pendingSynthSwaps` accumulators; differ only in the
  // shape of the AST anchor being emitted into. final flush via the host's queue.apply()
  function applyDestructuringTransforms() {
    const byStatement = new Map();
    for (const [, info] of pendingDestructuring) {
      if (!info.declPath?.node || !info.declaratorPath?.node) continue;
      const key = info.declPath.node;
      if (!byStatement.has(key)) byStatement.set(key, []);
      byStatement.get(key).push(info);
    }

    for (const [, infos] of byStatement) {
      const [{ declPath, isAssignment, isCatchClause }] = infos;

      if (isCatchClause) {
        emitCatchClause(infos, declPath.node);
        continue;
      }

      // shared classifier returns booleans both plugins consume from the same source.
      // assignment hosts skip classification (the booleans are VariableDeclaration-only
      // concerns - export/for-init slots can't host an AssignmentExpression directly)
      const hostShape = isAssignment ? null : classifyVariableDeclarationHost({
        declaration: declPath.node,
        declarationParent: declPath.parentPath?.node,
      });
      const isExport = hostShape?.isExport ?? false;
      const isForInit = hostShape?.isForInit ?? false;
      const replaceNode = isExport ? declPath.parentPath.node : declPath.node;
      const prefix = isExport ? 'export ' : '';
      const keyword = isAssignment ? '' : `${ declPath.node.kind } `;
      const stmtPrefix = isForInit ? '' : `${ prefix }${ keyword }`;
      const memoPrefix = isForInit ? '' : 'const ';

      function propKeySource(p) {
        return p.computed ? `[${ nodeSrc(p.key) }]` : nodeSrc(p.key);
      }

      function emitPolyfilled(info, parts, deferredSEs) {
        const { entries, allProps, initSrc, initIdentName, initStart, initEnd, scopeSnapshot } = info;
        let initTransformed = (initStart !== undefined && initEnd !== undefined
            ? transforms.extractContent(initStart, initEnd) : null) ?? initSrc;
        for (const e of entries) {
          if (e.propNode.computed) e.polyfillKeyContent = transforms.extractContent(e.propNode.key.start, e.propNode.key.end);
        }
        const polyfillKeys = new Set(entries.map(e => e.propNode));
        const hasRest = allProps.some(p => p.type === 'RestElement' || p.type === 'SpreadElement');
        const remaining = allProps.filter(p => !polyfillKeys.has(p));
        const hasInstance = entries.some(e => e.kind === 'instance');
        const resolvedGlobalName = initIdentName || globalProxyMemberName(unwrapParens(info.initNode));
        if ((remaining.length > 0 || hasRest || hasInstance) && initTransformed === initSrc && resolvedGlobalName) {
          const initResolved = resolvePure({ kind: 'global', name: resolvedGlobalName }, null);
          if (initResolved) initTransformed = injectPureImport(initResolved.entry, initResolved.hintName);
        }
        const needsMemo = hasInstance && !resolvedGlobalName && (entries.length > 1 || remaining.length > 0 || hasRest);
        let objRef = initTransformed;
        if (needsMemo && initTransformed) {
          objRef = injector.generateLocalRef();
          parts.push(`${ memoPrefix }${ objRef } = ${ initTransformed }`);
        }

        for (const e of entries) {
          const isInstance = e.kind === 'instance' && initSrc;
          const valueSrc = isInstance ? `${ e.binding }(${ objRef })` : e.binding;
          if (e.defaultSrc) {
            let ref = null;
            if (isInstance) ref = scopeTracker.genRef(scopeSnapshot);
            const test = ref ? `(${ ref } = ${ valueSrc })` : valueSrc;
            parts.push(`${ stmtPrefix }${ e.localName } = ${ test } === void 0 ? ${ e.defaultSrc } : ${ ref || valueSrc }`);
          } else {
            parts.push(`${ stmtPrefix }${ e.localName } = ${ valueSrc }`);
          }
        }

        if (!hasInstance && !hasRest && remaining.length === 0 && initSrc
            && mayHaveSideEffects(info.initNode)) {
          deferredSEs.push(isForInit
              ? `${ injector.generateLocalRef() } = ${ initTransformed }`
              : initTransformed);
        }

        const entryByProp = hasRest ? new Map(entries.map(e => [e.propNode, e])) : null;
        const rebuiltProps = hasRest
            ? allProps.map(p => {
              const e = entryByProp.get(p);
              if (!e) return nodeSrc(p);
              const keySrc = e.polyfillKeyContent ? `[${ e.polyfillKeyContent }]` : propKeySource(p);
              return `${ keySrc }: ${ injector.generateUnusedName() }`;
            })
            : remaining.map(p => nodeSrc(p));
        if (rebuiltProps.length > 0) {
          parts.push(isAssignment
              ? `({ ${ rebuiltProps.join(', ') } } = ${ objRef })`
              : `${ stmtPrefix }{ ${ rebuiltProps.join(', ') } } = ${ objRef }`);
        }
      }

      const parts = [];
      const deferredSEs = [];
      if (isAssignment) {
        for (const info of infos) emitPolyfilled(info, parts, deferredSEs);
      } else {
        const polyfilledByDecl = new Map(infos.map(i => [i.declaratorPath.node, i]));
        for (const dec of declPath.node.declarations) {
          const info = polyfilledByDecl.get(dec);
          if (info) emitPolyfilled(info, parts, deferredSEs);
          else parts.push(`${ stmtPrefix }${ nodeSrc(dec) }`);
        }
      }
      if (deferredSEs.length) parts.unshift(...deferredSEs);

      if (isForInit) {
        transforms.add(replaceNode.start, replaceNode.end, `${ keyword }${ parts.join(', ') }`);
      } else {
        const needsBlock = parts.length > 1 && isBodylessStatementBody(declPath);
        const joined = `${ parts.join(';\n') };`;
        transforms.add(replaceNode.start, replaceNode.end,
            needsBlock ? `{ ${ joined } }` : joined);
      }
    }
  }

  return {
    applyDestructuringTransforms,
    applySynthSwaps,
    canFullyConsumeProxyDeclarator,
    handleDestructuringPure,
  };
}
