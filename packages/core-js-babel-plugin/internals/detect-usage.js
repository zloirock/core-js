import {
  buildDestructuringInitMeta,
  chooseFallbackReceiverNode,
  isInnerDestructureDefault,
  resolveArrayWrapperedDestructureReceiver as sharedResolveArrayWrapperedDestructureReceiver,
  resolveNestedDestructureReceiver as sharedResolveNestedDestructureReceiver,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  checkLogicalAssignLhsGlobal,
  checkLogicalAssignLhsMember,
  isKnownGlobalName,
} from '@core-js/polyfill-provider/detect-usage/globals';
import { checkTypeAnnotations, walkTypeAnnotationGlobals } from '@core-js/polyfill-provider/detect-usage/annotations';
import {
  createSelfRefVarGuard,
  resolveKey as sharedResolveKey,
  unwrapTransparentSeq,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { handleBinaryIn, handleMemberExpressionNode } from '@core-js/polyfill-provider/detect-usage/members';
import {
  createMutationSiteHandler,
  hasMutationCandidateShapes,
} from '@core-js/polyfill-provider/detect-usage/mutation-prepass';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';
import {
  findIifeArgForParam,
  findIifeCallSite,
  findTSRuntimeBindingInPath,
  isAmbientBindingShape,
  isAssignOrForXWriteTargetPath,
  isFunctionParamDestructureParent,
  isInUpdateOperand,
  isMemberWriteOnlyContext,
  isTSTypeOnlyIdentifierPath,
  resolveCallArgument,
  unwrapSafeSequenceTail,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { isPolyfillAliasBinding, isSymbolDestructureAliasBinding } from '@core-js/polyfill-provider/helpers/class-walk';

const IMPORT_SPECIFIER_TYPES = new Set([
  'ImportDefaultSpecifier',
  'ImportSpecifier',
  'ImportNamespaceSpecifier',
]);

// shared `unwrapTransparentSeq` peels paren / TS expression wrappers / safe SequenceExpression so
// `require('core-js/...' as any)` / `require((0, 'core-js/...'))` / `require(('core-js/...'))`
// all reach the underlying StringLiteral. parity with unplugin's adapter which routes the
// arg through the same helper before the type check
function isStringLiteral(node) {
  return unwrapTransparentSeq(node)?.type === 'StringLiteral';
}

function stringLiteralValue(node) {
  const inner = unwrapTransparentSeq(node);
  return inner?.type === 'StringLiteral' ? inner.value : null;
}

// factory for a Babel scope adapter bound to a specific plugin-instance injector.
// the closure over `getInjector` avoids module-level mutable state, which would race
// under parallel transforms (Vite/Rollup/thread-loader)
// scoped mutation pre-pass: the cheap shape gate runs first; only files that actually
// monkey-patch pay for the path traverse + canonical receiver resolution. shares every
// resolution step with the read side via `mutation-prepass` (provider)
export function collectMutationPrePass(programPath, adapter) {
  const mutated = new Set();
  if (!hasMutationCandidateShapes(programPath.node)) return { mutated };
  const handleSite = createMutationSiteHandler({ adapter, mutated });
  programPath.traverse({
    // member visits classify destructure-LHS / for-x contexts; the HOST visits classify
    // delete / update / assignment with a downward wrapper peel (stacked parens / TS casts)
    MemberExpression: handleSite,
    OptionalMemberExpression: handleSite,
    CallExpression: handleSite,
    // `Object?.assign(Array, {...})` is an OptionalCallExpression - without this visitor the
    // optional-call mutation escapes detection and usage-pure substitutes over the user patch
    OptionalCallExpression: handleSite,
    AssignmentExpression: handleSite,
    UpdateExpression: handleSite,
    UnaryExpression: handleSite,
    // @babel/types omits `decorators` from TSParameterProperty's visitor keys, so this scoped
    // traverse never descends into a constructor parameter-property's legacy decorator and a
    // monkey-patch hidden there escapes detection - usage-pure would then substitute over the
    // user patch. requeue each decorator so the mutation-site visitors fire on it, mirroring
    // the read-side requeue in createUsageVisitors
    TSParameterProperty(path) {
      if (!path.node.decorators?.length) return;
      for (const decoratorPath of path.get('decorators')) path.requeue(decoratorPath);
    },
  });
  return { mutated };
}

export function createBabelAdapter(getInjector = () => null, method = null, getMutatedStatics = () => null) {
  const adapter = {
    // the provider mode this adapter serves. only `usage-pure` rewrites a proxy-global alias to
    // a receiver-less helper (dropping the receiver), so the shared resolver gates the
    // assignment-dominates-use soundness check on it; global / entry modes keep the call site and
    // inject side-effect imports, which is sound regardless of where the alias was assigned
    method,
    // a static the user monkey-patches is not a polyfillable static (pure only): detection
    // leaves its receiver to the identifier machinery so the patch and the reads share the
    // injected constructor object
    isMutatedStatic(object, key) {
      return method === 'usage-pure' && !!getMutatedStatics()?.has(`${ object }.${ key }`);
    },
    // user-resolved package prefixes (`pkg` + `additionalPackages`) for symbol-import
    // detection in `bindingSymbolKey`. null when injector hasn't published packages or
    // adapter constructed without an injector closure (entry-only detect path)
    get packages() { return getInjector()?.packages ?? null; },
    hasBinding(scope, name, path = null) {
      // user-declared runtime bindings (var/let/const/function/class/import/TSImportEquals).
      // `getBindingIdentifier` is narrow - `scope.hasBinding` would also fire for free-variable
      // globals just by being seen (`const x = Map` makes `Map` "bound" globally), too coarse.
      // type-only TSImportEquals is elided by tsc - references resolve to the global, so it
      // doesn't shadow for polyfill purposes; fall through to runtime / injector checks
      if (scope.getBindingIdentifier(name)) {
        const b = scope.getBinding?.(name);
        // shared `isAmbientBindingShape` covers all tsc-elided binding forms (declare,
        // type-only imports in 3 ESM variants, type-only TSImportEquals). without filtering
        // these, the binding would shadow the polyfill even though it doesn't exist at runtime
        if (!b || !isAmbientBindingShape(b.path.node, b.path.parent)) return true;
      }
      // TS-runtime declarations babel scope doesn't expose via getBindingIdentifier:
      // regular `enum`/`namespace`, `const enum`. walk path's ancestor chain (Program,
      // BlockStatement, TSModuleBlock, StaticBlock) so nested `function f() { enum Map }`
      // and `namespace Outer { namespace Map }` correctly shadow. anchor preference: explicit
      // `path` (reaches inner anchors) > scope's path (anchors at scope owner only). helper
      // excludes `declare X` (ambient - runtime supplied externally; polyfill should fire)
      const anchor = path ?? scope.path ?? null;
      if (anchor && findTSRuntimeBindingInPath(anchor, name)) return true;
      // plugin-managed pure-import alias / user destructure aliases
      return !!getInjector()?.getBindingInfo(name);
    },
    getBinding(scope, name) {
      // `polyfillHint` lets `resolveBindingToGlobal` walk back to the source global through:
      // (a) injector's pure-import table - `_Symbol` / `_globalThis` after in-place AST
      // rewrite; (b) globalAlias table - user destructure aliases (`{Symbol: S} = globalThis`
      // -> `S`) whose mutated binding shape `resolveBindingToGlobal` can't walk on its own.
      // hint-only fallback handles babel scope-tracker lag after `replaceWith` during
      // traversal (scope.getBinding empty even though the AST has the declaration).
      // shadow guard: only attach the injector's `polyfillHint` when the scope binding is
      // itself the polyfill import (or a destructure-alias from `registerGlobalAlias`).
      // a user-side declaration with a matching name (`function MyPromise() {}` shadowing
      // an `import MyPromise from "@core-js/pure/.../promise"` in an outer scope) would
      // otherwise pick up `polyfillHint='Promise'` cross-shadow, and downstream
      // `resolveBindingToGlobal` would dispatch `super.try` on `class extends MyPromise`
      // as the Promise polyfill - silently miswiring user code
      const info = getInjector()?.getBindingInfo(name) ?? null;
      const b = scope.getBinding(name);
      if (b) {
        const isImportBinding = IMPORT_SPECIFIER_TYPES.has(b.path.node?.type);
        const importSource = isImportBinding ? b.path.parent?.source?.value ?? null : null;
        // `info.source !== null` means a registered pure import - only attach the hint when the
        // actual scope binding IS that import. `info.source === null` is a destructure-alias from
        // `registerGlobalAlias`; the shared predicate identifies the real alias binding (init resolves
        // to the destructured global, any declaration kind) and rejects user-declared shadows
        const isAliasBindingShape = isPolyfillAliasBinding({ info, binding: b, scope, adapter, injector: getInjector() });
        const polyfillHint = info && (isAliasBindingShape || isImportBinding) ? info.hint : null;
        // a destructured Symbol.X alias (`const { iterator } = Symbol`) is a PATTERN binding, so it
        // carries no `importSource` and its hint is the UID (`iterator`); surface the registered module
        // source so `bindingSymbolKey` can fold `obj[iterator]`. the shadow gate rejects a nested
        // same-name binding whose RHS is not Symbol (the name-keyed injector info is flat)
        const aliasSymbolSource = isSymbolDestructureAliasBinding({ info, binding: b, scope, adapter, injector: getInjector() })
          ? info.source : null;
        return { node: b.path.node, kind: b.kind, constantViolations: b.constantViolations, importSource, polyfillHint, aliasSymbolSource };
      }
      if (!info) return null;
      return { node: null, constantViolations: null, importSource: info.source, polyfillHint: info.hint };
    },
    getBindingNodeType(scope, name) {
      // `?.path` defense - virtual bindings (plugin-injected pure imports before scope.crawl)
      // may have `.path` undefined; without `?.` the inner `.node` access throws TypeError.
      // unplug-side adapter already had this defense; aligning shape across adapters
      return scope.getBinding(name)?.path?.node?.type ?? null;
    },
    isStringLiteral,
    getStringValue: stringLiteralValue,
  };
  return adapter;
}

// no-tracking adapter for detect-entry's `require('core-js/...')` literal check
export const babelAdapter = createBabelAdapter();

// babel visitor key for nodes whose `typeAnnotation` / `returnType` / params need walking:
// function-likes (param + return types), object-method shorthand, class-method shapes
// (`m(x: Foo): Bar`), AND class-field shapes (`x: Map<T>`, `accessor y: Set<T>`) whose
// typeAnnotation sits on the field-level node itself. babel splits these into distinct
// node types - listing them all in one `|`-pattern so they share one visitor body
const TYPE_ANNOTATION_HOSTS = [
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ClassMethod',
  'ClassPrivateMethod',
  'ObjectMethod',
  'ClassProperty',
  'ClassPrivateProperty',
  'ClassAccessorProperty',
].join('|');

// symbol-keyed per-file reset hook on the visitors object - symbol so babel's visitor
// enumerator (own string keys only) does not mistake it for a node-type visitor
export const USAGE_VISITORS_RESET = Symbol('core-js.usageVisitors.reset');
// symbol-keyed `handledObjects.has` so post-sweep can skip nodes that `handleBinaryIn`
// already covered (e.g. `Symbol` in `Symbol.iterator in obj`)
export const USAGE_VISITORS_IS_HANDLED = Symbol('core-js.usageVisitors.isHandled');

export function createUsageVisitors({
  adapter,
  isEntryAvailable,
  method,
  onUsage,
  onWarning,
  resolveMeta,
  resolvePure = null,
  resolvedType,
  suppressProxyGlobals = false,
  toHint,
  walkAnnotations = true,
}) {
  // only usage-pure rewrites global identifiers to named import bindings (which are frozen).
  // usage-global injects side-effect imports and leaves the identifier alone, so `Map++`
  // must polyfill - otherwise `Map` ReferenceError's in engines where the native is missing
  const skipUpdateTargets = method === 'usage-pure';
  let handledObjects = new WeakSet();
  let isSelfRefVarBinding = createSelfRefVarGuard(b => b.kind);

  // destructure-only wrapper (every caller is inside handleDestructuring): a side-effecting
  // computed key resolves to its tail for identity; the emitter keeps the key in the pattern (it
  // runs once) and adds an inline default `= _Array$from`, so the static is polyfilled, not bailed
  function resolveKey(path, computed) {
    return sharedResolveKey({ node: path.node, computed, scope: path.scope, adapter });
  }

  // `skipReferencedCheck` bypasses babel's `isReferencedIdentifier` for callers that have
  // already established the read context (e.g., assignment LHS - strict-mode binding lookup)
  function handleIdentifier(path, skipReferencedCheck = false) {
    // orphaned node (parent removed by a sibling transform): `isReferencedIdentifier`
    // reads `parent.type` unconditionally and would crash. check BEFORE everything else
    if (!path.parent) return;
    if (!skipReferencedCheck && !path.isReferencedIdentifier()) return;
    // logical-assign LHS warning lives on a dedicated `Identifier` visitor (babel
    // classifies `Map ||= X` LHS as non-reference, so it doesn't reach this path)
    // ReferencedIdentifier matches JSXIdentifier in too many positions. accept:
    //   `<Foo />` - direct opening-element name
    //   `<Foo.Bar.Baz />` - root of N-deep JSXMemberExpression chain at opening-element
    //     name slot. the root identifier IS a runtime reference; the .Bar.Baz chain
    //     accesses props on it. walks through the chain so deeper-than-2 still detects
    // reject everything else: attribute names, JSXNamespacedName parts, .property positions
    if (path.node.type === 'JSXIdentifier') {
      let cur = path;
      while (cur?.parent?.type === 'JSXMemberExpression' && cur.parent.object === cur.node) {
        cur = cur.parentPath;
      }
      if (cur?.parent?.type !== 'JSXOpeningElement' || cur.key !== 'name') return;
    }
    // TS type-only positions: `type X = ...` / `interface X {...}` / `import type X = require(...)`
    // ids and `export { type X }` / `import type { X }` specifiers. babel's
    // `isReferencedIdentifier` marks them as referenced, but no runtime binding exists -
    // polyfilling is pure over-injection (and breaks TS output for exports / duplicates the
    // import LHS for TSImportEquals)
    if (isTSTypeOnlyIdentifierPath(path)) return;
    // usage-pure cannot rewrite a global at a write position to a frozen import binding (the
    // write would TypeError): UpdateExpression operand (`Map++`, `--Map`, `(Map)++`), an
    // assignment LHS (`Map = x`, `Map ||= x`), or a for-of / for-in head bare-Identifier LHS
    // (`for (Map of arr)`). a TS-non-null / paren wrapper (`Map! ||= x`, `for (Map! of arr)`)
    // keeps `isReferencedIdentifier` true so the read reaches here; both checks peel transparent
    // ancestors before testing the write shapes
    if (skipUpdateTargets && (isInUpdateOperand(path.parentPath) || isAssignOrForXWriteTargetPath(path))) return;
    const { node } = path;
    // adapter.hasBinding folds in two filters: skips type-only TSImportEquals (elided by
    // tsc - runtime resolves to global) and recognises plugin-managed bindings (pure-import
    // aliases, global destructure aliases). single check, parity with unplugin's visitor
    if (adapter.hasBinding(path.scope, node.name, path)) {
      // self-reference `var X = X` - hoisted var init references its own name, which at
      // runtime reads from the outer (global) scope before the local is assigned. narrow
      // path intentionally: ImportSpecifiers, class-decls, and const-to-identifier aliases
      // are excluded so user-owned pure imports (e.g. `const MyPromiseTry = ...`) don't get
      // re-routed through generic-global polyfill
      if (!isSelfRefVarBinding(path.scope.getBinding(node.name))) return;
      // name equals the binding's own name (we looked up `binding` by `node.name`), so
      // `isKnownGlobalName(node.name)` is sufficient - `resolveBindingToGlobal` would
      // walk a now-mutated `init` and give an unreliable answer
      if (!isKnownGlobalName(node.name)) return;
      if (handledObjects.has(node)) return;
      onUsage({ kind: 'global', name: node.name }, path);
      return;
    }
    // see `handleBinaryIn` - only resolved polyfillable keys seed `handledObjects`
    if (handledObjects.has(node)) return;
    onUsage({ kind: 'global', name: node.name }, path);
  }

  function handleMemberExpression(path) {
    const { node, parent } = path;
    // `globalThis.Map ||= X` / `globalThis.self.Map ||= X` - check BEFORE inner-identifier
    // visit rewrites `globalThis` -> `_globalThis` (at which point the chain breaks).
    // `globalProxyMemberName` (used inside the helper) walks proxy-global chains and gates
    // on shadowing internally - no separate isBound computation needed at this site
    // usage-pure rewrites globals to read-only import bindings; `_Map ||= X` would TypeError
    // at write time, so emit the warning. usage-global leaves the chain untouched - side-effect
    // imports populate the proxy-global before module body, so `||=` no-ops without emitting
    // user-visible problem. skip in global mode to avoid false-positive warning noise
    if (onWarning && method === 'usage-pure') {
      const warning = checkLogicalAssignLhsMember({ path, scope: path.scope, adapter });
      if (warning) onWarning(warning);
    }
    if (handledObjects.has(node)) return;
    if (isMemberWriteOnlyContext(node, parent, path.parentPath?.parent)) {
      // a guarded SHIM write stays fully native (its statement is ignored as polyfill
      // intent); a deliberate override's receiver follows the SAME identifier routing the
      // reads use, so the patch and the reads land on one object - no marking there
      // its receiver follows the SAME identifier routing the (always-mutated-by-definition)
      // reads use, so the patch and the reads land on one object - no marking
      return;
    }
    const meta = handleMemberExpressionNode({
      node, scope: path.scope, adapter, handledObjects, suppressProxyGlobals, path, resolveMeta,
    });
    if (meta) {
      onUsage(meta, path);
      // usage-global union: extra reachable receiver / key targets each earn a side-effect import
      for (const extra of meta.extraCandidates ?? []) onUsage(extra, path);
    }
  }

  // nested pattern `{ X: { y } } = Z` - inner ObjectPattern lives under an outer ObjectProperty.
  // N-deep: resolve the outer key chain to an effective receiver, emit meta accordingly
  function emitNestedDestructureMeta(path, outerProp) {
    const innerKey = sharedResolveKey({
      node: path.node.key, computed: path.node.computed, scope: path.scope, adapter,
    });
    if (!innerKey) return;
    const receiverKey = sharedResolveNestedDestructureReceiver(outerProp, adapter);
    // a monkey-patched static is NOT a polyfillable destructure source (the same gate the
    // provider's init-meta builder applies): emit NO meta at all - the typeless form would
    // fall to the instance dispatcher. the prop stays raw and the receiver routes through
    // the identifier machinery, so the patch and the read share one object
    if (receiverKey !== null && adapter.isMutatedStatic?.(receiverKey, innerKey)) return;
    onUsage(receiverKey !== null
      ? { kind: 'property', object: receiverKey, key: innerKey, placement: 'static' }
      : { kind: 'property', object: null, key: innerKey, placement: null }, path);
  }

  function handleDestructuring(path) {
    const objectPattern = path.parentPath;
    if (!objectPattern.isObjectPattern()) return;
    const parent = objectPattern.parentPath;
    let initPath;
    if (parent.isVariableDeclarator()) {
      initPath = parent.get('init');
      if (!initPath?.node) {
        const key = resolveKey(path.get('key'), path.node.computed);
        if (key) onUsage({ kind: 'property', object: null, key, placement: null }, path);
        return;
      }
    } else if (parent.isAssignmentExpression()) {
      initPath = parent.get('right');
    } else if (parent.isAssignmentPattern() && isFunctionParamDestructureParent(objectPattern)
      && !isInnerDestructureDefault(parent)) {
      // `function({ from } = Array)` - AssignmentPattern wraps the param; the default
      // expression is the receiver that our destructure targets when the arg is omitted.
      // for IIFE with statically-classifiable caller-arg (`(({from} = Array) => ...)(Set)`),
      // wrapper-default is dead code at runtime - resolve against caller-arg instead.
      // peel SE-tail / paren / TS wrappers off the caller-arg first (`(0, Array)` / `(Array)` ->
      // `Array`) so a wrapped bare global classifies - matches the synth-swap emit path, which
      // already peels via the same helper (without this, detect resolves against the dead default).
      // genuinely non-Identifier shapes (`(...)(globalThis.X)`, `(...)(call())`) stay un-classifiable,
      // so wrapper-default keeps the static receiver context and the runtime fallback carries it
      const key = resolveKey(path.get('key'), path.node.computed);
      if (!key) return;
      const argNode = unwrapSafeSequenceTail(findIifeArgForParam(parent.parentPath, parent.node));
      // caller-arg wins over the default when it is a usable fallback receiver (classifiable, or a
      // conditional / logical enumerated per-branch), OR a safe-access proxy-global member-expr whose
      // default is a polyfill dead-end; a non-receiver arg (notably `undefined`, where the runtime
      // applies the default) keeps the default. single-sourced chooser shared with unplugin + the emitters
      const receiverNode = chooseFallbackReceiverNode({
        argNode, defaultNode: parent.node.right, objectPattern: parent.node.left, scope: parent.scope, adapter, path, resolvePure,
      });
      const meta = buildDestructuringInitMeta({ initNode: receiverNode, key, scope: parent.scope, adapter, path });
      if (meta) onUsage(meta, path);
      return;
    } else if (parent.isAssignmentPattern() && parent.parentPath?.isObjectProperty()
      && parent.node.left === objectPattern.node) {
      // nested destructure with inner-default: `{ Array: { from } = {} } = X` - AssignmentPattern
      // wraps inner ObjectPattern and provides default `{}` if `X.Array` is undefined. for
      // proxy-global receivers `X.Array` is always defined, so default is dead code; treat
      // AssignmentPattern as transparent and resolve via the same nested chain as the bare
      // `{ Array: { from } } = X` shape
      emitNestedDestructureMeta(path, parent.parentPath);
      return;
    } else if (parent.isObjectProperty()) {
      emitNestedDestructureMeta(path, parent);
      return;
    } else if (parent.isArrayPattern()
      || (parent.isAssignmentPattern() && parent.node.left === objectPattern.node
        && parent.parentPath?.isArrayPattern())) {
      // ArrayPattern-rooted nested destructure `const [{from}] = wrapper` (or with a transparent
      // inner-default `const [{from} = {}] = wrapper`, where the AssignmentPattern wraps the
      // ObjectPattern as an ArrayPattern element) - walk up the ArrayPattern stack to the host
      // and descend Identifier-aliased ArrayExpression wrappers to find the leaf constructor;
      // the shared resolver peels the inner-default wrapper. fall through to typeless when none
      const key = resolveKey(path.get('key'), path.node.computed);
      if (!key) return;
      const constructor = sharedResolveArrayWrapperedDestructureReceiver(objectPattern, adapter);
      // mutated static: no meta at all (a typeless meta would dispatch the instance helper)
      if (constructor && adapter.isMutatedStatic?.(constructor, key)) return;
      onUsage(constructor
        ? { kind: 'property', object: constructor, key, placement: 'static' }
        : { kind: 'property', object: null, key, placement: null }, path);
      return;
    } else if (parent.isAssignmentPattern()
      || parent.isForOfStatement()
      || parent.isForInStatement()
      || parent.isRestElement()
      || parent.isCatchClause()) {
      // for-of / catch: unknown receiver, emit typeless meta
      const key = resolveKey(path.get('key'), path.node.computed);
      if (key) onUsage({ kind: 'property', object: null, key, placement: null }, path);
      return;
    } else if (parent.isFunction()) {
      // IIFE: `(({from}) => {})(Array)` / `!function({from}) {}(Array)`. shared
      // `findIifeCallSite` peels wrapper chain (Unary / Sequence / Paren / Chain / TS),
      // accepts CallExpression / NewExpression / OptionalCallExpression, AND enforces
      // the callee-identity gate (`peelIifeCallee(callee, fn) === fn`) so functions
      // PASSED AS ARGS to another call (`doStuff(Array, function({from}) {...})`) don't
      // get misclassified as IIFEs reading from the outer call's args
      const site = findIifeCallSite(parent, objectPattern.node);
      if (!site) return;
      const key = resolveKey(path.get('key'), path.node.computed);
      if (!key) return;
      const argNode = resolveCallArgument(site.callPath.node.arguments, site.paramIndex);
      const meta = buildDestructuringInitMeta({ initNode: argNode ?? null, key, scope: site.callPath.scope, adapter, path });
      if (meta) onUsage(meta, path);
      return;
    } else return;
    if (!initPath?.node) return;
    const key = resolveKey(path.get('key'), path.node.computed);
    if (!key) return;
    let meta = buildDestructuringInitMeta({ initNode: initPath.node, key, scope: initPath.scope, adapter, path });
    // null = monkey-patched static: the prop stays raw, the receiver substitutes elsewhere
    if (!meta) return;
    // follow memoized reference type (e.g., const _ref = [1,2,3] after memoization).
    // spread instead of in-place mutation: contract with buildDestructuringInitMeta
    // doesn't promise mutable meta, and a fresh object is cheap here
    const cachedInitType = resolvedType?.get(initPath.node);
    if (!meta.placement && cachedInitType) {
      // cache stores the canonical Type object; convert to lowercase hint string for
      // `meta.object` dispatch (TYPE_HINTS keys are lowercase)
      const objectHint = toHint?.(cachedInitType);
      if (objectHint) meta = { ...meta, object: objectHint, placement: 'prototype' };
    }
    onUsage(meta, path);
  }

  function handleBinaryExpression(path) {
    const meta = handleBinaryIn({
      node: path.node, scope: path.scope, adapter, handledObjects, isEntryAvailable, suppressProxyGlobals, path,
    });
    if (meta) onUsage(meta, path);
  }

  // a name in `T` of `let x: T` is a polyfill candidate only if no local binding shadows it
  // (`class Map {}; let x: Map = ...` must NOT pull in es.map.constructor). route through
  // the adapter's `hasBinding` so the same filters apply as for `handleIdentifier`: ambient
  // declarations (`declare const Map`) DON'T shadow (binding is tsc-elided); TS-runtime
  // declarations (`enum Map`, `namespace Map`) DO shadow (resolved via path ancestor walk).
  // a raw `getBindingIdentifier` here misses TS-runtime shadows entirely and conversely
  // over-skips on ambient declarations - both avoided by going through the adapter
  function annotationGlobal(path) {
    return name => {
      if (adapter.hasBinding(path.scope, name, path)) return;
      onUsage({ kind: 'global', name }, path);
    };
  }

  return {
    ...walkAnnotations ? {
      // babel exposes methods as distinct node types (not MethodDefinition wrappers), so
      // their params/returnType/typeAnnotation need explicit visitor entries. otherwise
      // `class C { m(x: Foo): Bar {} }` misses Foo/Bar on babel while unplugin catches them
      // through the underlying FunctionExpression - parser divergence.
      // class-field shapes (`class C { x: Map<T>; accessor y: Set<T> }`) carry their
      // typeAnnotation on the field-level node, NOT on a nested function, so they need
      // explicit dispatch too - without it the Map / Set polyfills miss on class-field
      // annotations even though the same annotation on a function param would emit
      [TYPE_ANNOTATION_HOSTS](path) {
        checkTypeAnnotations(path.node, annotationGlobal(path));
      },
      VariableDeclarator(path) {
        if (path.node.id?.typeAnnotation) {
          walkTypeAnnotationGlobals(path.node.id.typeAnnotation, annotationGlobal(path));
        }
      },
      CatchClause(path) {
        if (path.node.param?.typeAnnotation) {
          walkTypeAnnotationGlobals(path.node.param.typeAnnotation, annotationGlobal(path));
        }
      },
    } : null,
    // ReferencedIdentifier covers all read positions for polyfill detection. a combined
    // `'ReferencedIdentifier|Identifier'` shape would register the handler twice via
    // `visitors.explode`, firing handleIdentifier twice per referenced Identifier
    // (the second pass guarded by `handledObjects` WeakSet, but parent / warning /
    // isReferenced checks would run twice). two visitors instead: ReferencedIdentifier
    // handles polyfill detection; bare Identifier handles the logical-assign LHS warning
    // (babel classifies `Map ||= X` LHS as non-reference, so ReferencedIdentifier
    // never fires for it - need a separate visitor to surface the diagnostic)
    ReferencedIdentifier: handleIdentifier,
    Identifier(path) {
      if (!path.parent) return;
      const { parent } = path;
      // assignment LHS in global mode: strict-mode reads the binding before the write, so
      // `Map = X` / `Map ||= X` / `Map += 1` all need the polyfill. babel's
      // `isReferencedIdentifier` returns false for AssignmentExpression.left, so fire manually
      if (method !== 'usage-pure'
        && parent.type === 'AssignmentExpression'
        && parent.left === path.node) return handleIdentifier(path, true);
      // pure mode: logical-assign LHS warning. `adapter.hasBinding` folds in TS-runtime
      // shadows (`enum Map {}` / `namespace Map {}`) so `Map ||= Y` with local enum stays silent
      if (method === 'usage-pure' && onWarning !== undefined) {
        const warning = checkLogicalAssignLhsGlobal(path,
          adapter.hasBinding(path.scope, path.node.name, path));
        if (warning) onWarning(warning);
      }
    },
    'MemberExpression|OptionalMemberExpression': handleMemberExpression,
    ObjectProperty(path) {
      if (path.node.method) return;
      handleDestructuring(path);
    },
    BinaryExpression: handleBinaryExpression,
    // @babel/types omits `decorators` from TSParameterProperty's visitor keys, so @babel/traverse
    // never descends into a legacy param decorator's expression on a constructor parameter-property
    // (`constructor(@dec(Array.from([1])) private p) {}`) and its polyfillable globals go undetected.
    // requeue each decorator so the usage detectors run on it. plain Identifier params need no help -
    // their visitor keys keep `decorators`. (RestElement / ArrayPattern share the visitorKeys gap but
    // a decorator on a rest / destructured param is not parseable, so only this shape is reachable.)
    // guard on length so non-decorated parameter properties are untouched
    TSParameterProperty(path) {
      if (!path.node.decorators?.length) return;
      for (const decoratorPath of path.get('decorators')) path.requeue(decoratorPath);
    },
    // Program.enter calls this to drop per-file WeakSet state
    [USAGE_VISITORS_RESET]: () => {
      handledObjects = new WeakSet();
      isSelfRefVarBinding = createSelfRefVarGuard(b => b.kind);
    },
    [USAGE_VISITORS_IS_HANDLED]: node => handledObjects.has(node),
  };
}

// syntax visitors for Babel - thin wrapper over shared createSyntaxRules
export function createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack = false }) {
  const rules = createSyntaxRules({
    injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack,
  });
  return {
    // CallExpression path covers @babel/parser@7 where `import('mod')` is
    // CallExpression { callee: { type: 'Import' } }. @babel/parser@8 parses the same
    // source as a top-level ImportExpression node - hence the second visitor below
    CallExpression(path) {
      if (path.get('callee').isImport()) rules.onImportExpression(path.node);
    },
    ImportExpression(path) { rules.onImportExpression(path.node); },
    Function(path) { rules.onFunction(path.node); },
    'ForOfStatement|ArrayPattern'(path) {
      if (path.isForOfStatement()) rules.onForOfStatement(path.node);
      else rules.onArrayPattern(path.node);
    },
    SpreadElement(path) { rules.onSpreadElement(path.node, path.parentPath.node.type); },
    YieldExpression(path) { rules.onYieldExpression(path.node); },
    VariableDeclaration(path) { rules.onVariableDeclaration(path.node); },
    Class(path) { rules.onClass(path.node); },
  };
}
