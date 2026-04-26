// destructure rewrite pipeline. covers parameter-default synth-swap entry, top-level
// VariableDeclarator extraction (instance / static / global kinds), AssignmentExpression
// destructure flatten, nested proxy-global flatten (`{Array:{from}} = globalThis` ->
// `const from = _Array$from`), and CatchClause receiver extraction.
// public surface: `handleObjectPropertyResult`, `extractCatchClause`. instantiated per-file
// in `initFile` so closure-captured per-file state (`skippedNodes` / `synthSwap` / `injector`
// / `debugOutput`) stays in sync with the freshly-allocated values
import {
  destructureReceiverSlot,
  isFunctionParamDestructureParent,
  isIdentifierPropValue,
  isSynthSimpleObjectPattern,
  objectPatternPropNeedsReceiverRewrite,
  peelNestedSequenceExpressions,
  propBindingIdentifier,
} from '@core-js/polyfill-provider/helpers';
import {
  canTransformDestructuring as sharedCanTransformDestructuring,
  patternBindingName,
} from '@core-js/polyfill-provider/detect-usage';

export default function createDestructureEmitter({
  t,
  generateUnusedId,
  handleDestructuredProperty,
  injector,
  injectPureImport,
  resolveDestructuringObject,
  resolvePropertyObjectType,
  skippedNodes,
  synthSwap,
  toHint,
  getDebugOutput,
}) {
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
  // the buggy-present native case, but preserves receiver evaluation semantics
  function emitParamInlineDefault(prop, id) {
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
  function handleParameterDestructure(prop, kind, entry, hintName) {
    if (kind === 'instance') return;
    if (prop.node.computed || !t.isIdentifier(prop.node.key)) return;
    if (!isIdentifierPropValue(prop.node.value)) return;
    const objectPattern = prop.parentPath;
    const targetPath = isSynthSimpleObjectPattern(objectPattern.node)
      ? synthSwap.findTargetPath(objectPattern?.parentPath, objectPattern) : null;
    if (!targetPath) {
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
    synthSwap.registerPolyfill(targetPath, objectPattern, prop.node.key.name, entry, hintName);
  }

  // lift the leading-SE-tail of `receiver` as a standalone ExpressionStatement before
  // `hostPath`. peels ParenthesizedExpression so `(se(), G)` and bare `(se(), G)` both
  // surface the SE. NOT seeding skippedNodes for clones - the original SE got removed
  // with the host, so inner polyfillable usages need natural visitor pass to emit imports
  function liftSEPrefix(receiver, hostPath) {
    // shared `peelNestedSequenceExpressions` walks `(se1(), (se2(), G))` recursively;
    // without it only outermost se1() lifts and inner se2() silently elides under
    // the rewrite. clone each lifted node - inserting the original would relocate the
    // AST sub-tree, breaking sibling visitors that hold path references
    const { prefix } = peelNestedSequenceExpressions(receiver);
    if (!prefix.length) return;
    const cloned = prefix.map(e => t.cloneNode(e));
    const seStmt = cloned.length === 1
      ? t.expressionStatement(cloned[0])
      : t.expressionStatement(t.sequenceExpression(cloned));
    hostPath.insertBefore(seStmt);
  }

  // `({Array: {from}} = receiver); ...` (AssignmentExpression in ExpressionStatement) -
  // value of AssignmentExpression is discarded by the surrounding statement, so we can
  // replace the whole statement with `from = _Array$from`. matches VariableDeclarator's
  // "polyfill always wins" semantics. SE prefix in receiver lifts as separate statement
  function flattenAssignmentExpressionDestructure(assignPath, valueNode, entry, hintName) {
    const exprStmt = assignPath.parentPath;
    const id = injectPureImport(entry, hintName);
    liftSEPrefix(assignPath.node.right, exprStmt);
    // skip the destructure subtree so queued visitors short-circuit on its descendants
    t.traverseFast(assignPath.node, node => { skippedNodes.add(node); });
    exprStmt.replaceWith(t.expressionStatement(
      t.assignmentExpression('=', t.cloneNode(valueNode), t.cloneNode(id)),
    ));
    return true;
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
      const parent = pattern.parentPath;
      if (parent?.isVariableDeclarator()) break;
      // AssignmentExpression in ExpressionStatement context - the AssignmentExpression's
      // value is discarded, so replacing the whole statement with `from = _polyfill` is
      // semantically equivalent to "extract `from` via destructure, override with polyfill"
      if (parent?.isAssignmentExpression() && parent.node.left === pattern.node
          && parent.parentPath?.isExpressionStatement()) {
        return flattenAssignmentExpressionDestructure(parent, valueNode, entry, hintName);
      }
      if (!t.isObjectProperty(parent?.node)) return false;
      currentProp = parent;
    }
    const declarator = chain[chain.length - 1].pattern.parentPath;
    const declaration = declarator.parentPath;
    // for-init with SequenceExpression init - flatten would drop the SE prefix (can't
    // add a statement inside a loop header). leave the raw nested destructure in place;
    // non-SE for-init shapes still flatten through the `isForInit` branch below.
    // parser-preserved ParenthesizedExpression wrappers (`createParenthesizedExpressions:
    // true`) can wrap the SE - peel so the shape check still fires under those parser opts
    let forInitRaw = declarator.node.init;
    while (forInitRaw?.type === 'ParenthesizedExpression') forInitRaw = forInitRaw.expression;
    if (declaration.parentPath?.isForStatement()
      && declaration.parentPath.node.init === declaration.node
      && forInitRaw?.type === 'SequenceExpression') return false;
    const declCount = declaration.node?.declarations?.length ?? 1;
    const id = injectPureImport(entry, hintName);
    const extractedDeclarator = t.variableDeclarator(t.cloneNode(valueNode), t.cloneNode(id));
    // cascade: each level removes its property when the inner pattern has no siblings.
    // `willRemoveDeclarator` iff EVERY level's pattern had this as its sole property
    const willRemoveDeclarator = chain.every(({ pattern }) => pattern.node.properties.length === 1);
    // seed skippedNodes for the subtree about to be orphaned so scheduled visitor
    // re-entries short-circuit; handleIdentifier's `!path.parent` guard backs this up.
    // NOT calling scope.registerDeclaration on the new binding: attempting it triggered
    // "Duplicate declaration" errors in e2e when the enclosing `scope.crawl()` later
    // re-scanned. skippedNodes + programExit's implicit crawl are sufficient
    const skipSubtree = willRemoveDeclarator ? declarator.node : prop.node;
    t.traverseFast(skipSubtree, node => { skippedNodes.add(node); });
    // declarator-level insert in for-init keeps loop-header shape; declaration-level
    // insert would wrap for-init in an arrow-IIFE and duplicate the bound name inside.
    // for-init can't host external statements either, so SE-prefix lift below is gated
    // on this same predicate (caller bails earlier when for-init declarator has SE)
    const isForInit = declaration.parentPath?.isForStatement()
      && declaration.parentPath.node.init === declaration.node;
    if (!isForInit) liftSEPrefix(declarator.node.init, declaration);
    if (willRemoveDeclarator && declCount === 1) {
      // single-declarator simple-chain: replaceWith preserves leading comments
      declaration.replaceWith(t.variableDeclaration(declaration.node.kind, [extractedDeclarator]));
      return true;
    }
    if (isForInit) declarator.insertBefore(extractedDeclarator);
    else declaration.insertBefore(t.variableDeclaration(declaration.node.kind, [extractedDeclarator]));
    if (willRemoveDeclarator && declCount > 1) {
      // splice out the emptied declarator in-place; `.remove()` mid-traversal nulls
      // path.parent and crashes babel's virtual-type filter on queued inner Identifiers
      const idx = declaration.node.declarations.indexOf(declarator.node);
      if (idx !== -1) declaration.node.declarations.splice(idx, 1);
      return true;
    }
    // partial cascade: remove inner props while their pattern empties out. when the
    // remaining siblings are RestElement-only, replace prop value with `_unused`
    // sentinel instead of removing - rest gathers all OTHER own keys, so dropping
    // `Array: {...}` from `{Array: {...}, ...rest} = globalThis` would change runtime
    // semantics (`rest.Array` becomes defined, was excluded by the original destructure)
    for (const { prop: p, pattern } of chain) {
      const siblings = pattern.node.properties;
      const hasRest = siblings.some(s => s !== p.node && (s.type === 'RestElement' || s.type === 'SpreadElement'));
      const onlyRestRemains = hasRest && siblings.every(s => s === p.node || s.type === 'RestElement' || s.type === 'SpreadElement');
      if (onlyRestRemains) {
        p.get('value').replaceWith(generateUnusedId());
        p.node.shorthand = false;
        break;
      }
      p.remove();
      if (pattern.node.properties.length > 0) break;
    }
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
  function handleObjectPropertyResult(prop, meta, kind, entry, hintName) {
    if (meta?.fromFallback) {
      // try per-branch synth-swap on ConditionalExpression / LogicalExpression branches.
      // each viable branch becomes its own `{key: _Branch$key}` literal (preserving runtime
      // conditional semantics); non-viable branches stay raw. on full failure, warn
      const wrapperParent = prop.parentPath?.parentPath;
      const slot = destructureReceiverSlot(wrapperParent?.node);
      const registered = slot && synthSwap.tryRegisterPerBranchSynth(wrapperParent.get(slot), prop);
      if (!registered) {
        getDebugOutput()?.warn(`conditional destructure with polyfill candidate left untouched ("${ meta.key }" on fallback branch) - runtime availability depends on the selected branch`);
      }
      return;
    }
    const objectPattern = prop.parentPath;
    const patternParent = objectPattern?.parentPath;
    if (isFunctionParamDestructureParent(objectPattern)) {
      handleParameterDestructure(prop, kind, entry, hintName);
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
      handleParameterDestructure(prop, kind, entry, hintName);
      return;
    }
    if (!canTransformDestructuring(prop)) return;
    // export + rest: skip - `_unused` rename would pollute the module's export namespace
    if (objectPattern.node.properties.some(p => p.type === 'RestElement' || p.type === 'SpreadElement')
      && objectPattern.parentPath?.isVariableDeclarator()
      && objectPattern.parentPath.parentPath?.parentPath?.isExportNamedDeclaration()) return;
    let value;
    if (kind === 'instance') {
      const objectNode = resolveDestructuringObject(prop, toHint(resolvePropertyObjectType(prop)));
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
    if (!param.properties.some(objectPatternPropNeedsReceiverRewrite)) {
      const destructuredNames = new Set();
      for (const p of param.properties) {
        if (p.type !== 'ObjectProperty') continue;
        const name = p.value?.type === 'Identifier' ? p.value.name : null;
        if (name) destructuredNames.add(name);
      }
      let referenced = false;
      t.traverseFast(path.node.body, node => {
        if (!referenced && node.type === 'Identifier' && destructuredNames.has(node.name)) referenced = true;
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

  return { extractCatchClause, handleObjectPropertyResult };
}
