import {
  buildDestructuringInitMeta,
  checkLogicalAssignLhsGlobal,
  checkLogicalAssignLhsMember,
  checkTypeAnnotations,
  createSelfRefVarGuard,
  handleBinaryIn,
  handleMemberExpressionNode,
  isKnownGlobalName,
  resolveCallArgument,
  resolveKey as sharedResolveKey,
  resolveObjectName as sharedResolveObjectName,
  walkTypeAnnotationGlobals,
} from '@core-js/polyfill-provider/detect-usage';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';
import {
  POSSIBLE_GLOBAL_OBJECTS,
  TS_EXPR_WRAPPERS,
  findIifeArgForParam,
  findTSRuntimeBindingInPath,
  flattenableHostSlot,
  isAmbientBindingShape,
  isClassifiableReceiverArg,
  isFunctionParamDestructureParent,
  isInUpdateOperand,
  isMemberWriteOnlyContext,
  isTSTypeOnlyIdentifierPath,
  unwrapInitValue,
} from '@core-js/polyfill-provider/helpers';

const IMPORT_SPECIFIER_TYPES = new Set([
  'ImportDefaultSpecifier',
  'ImportSpecifier',
  'ImportNamespaceSpecifier',
]);

// `createParenthesizedExpressions: true` leaves `(('x'))` as a ParenthesizedExpression wrapper.
// peel so `require(('x'))` / `import(('x'))` entry detection matches the unwrapped form
// (parity with unplugin's estreeAdapter which calls `unwrapParens` before the type check)
function peelParens(node) {
  while (node?.type === 'ParenthesizedExpression') node = node.expression;
  return node;
}
const isStringLiteral = node => peelParens(node)?.type === 'StringLiteral';
const stringLiteralValue = node => {
  const inner = peelParens(node);
  return inner?.type === 'StringLiteral' ? inner.value : null;
};

// factory for a Babel scope adapter bound to a specific plugin-instance injector.
// the closure over `getInjector` avoids module-level mutable state, which would race
// under parallel transforms (Vite/Rollup/thread-loader)
export function createBabelAdapter(getInjector = () => null) {
  return {
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
      // traversal (scope.getBinding empty even though the AST has the declaration)
      const info = getInjector()?.getBindingInfo(name) ?? null;
      const b = scope.getBinding(name);
      if (b) {
        const importSource = IMPORT_SPECIFIER_TYPES.has(b.path.node?.type)
          ? b.path.parent?.source?.value ?? null : null;
        return { node: b.path.node, constantViolations: b.constantViolations, importSource, polyfillHint: info?.hint ?? null };
      }
      if (!info) return null;
      return { node: null, constantViolations: null, importSource: info.source, polyfillHint: info.hint };
    },
    getBindingNodeType(scope, name) {
      return scope.getBinding(name)?.path.node?.type ?? null;
    },
    isStringLiteral,
    getStringValue: stringLiteralValue,
  };
}

// no-tracking adapter for detect-entry's `require('core-js/...')` literal check
export const babelAdapter = createBabelAdapter();

// symbol-keyed per-file reset hook on the visitors object - symbol so babel's visitor
// enumerator (own string keys only) does not mistake it for a node-type visitor
export const USAGE_VISITORS_RESET = Symbol('core-js.usageVisitors.reset');
// symbol-keyed `handledObjects.has` so post-sweep can skip nodes that `handleBinaryIn`
// already covered (e.g. `Symbol` in `Symbol.iterator in obj`)
export const USAGE_VISITORS_IS_HANDLED = Symbol('core-js.usageVisitors.isHandled');

export function createUsageVisitors({
  onUsage, onWarning, adapter, method, suppressProxyGlobals = false, walkAnnotations = true, isEntryAvailable,
}) {
  // only usage-pure rewrites global identifiers to named import bindings (which are frozen).
  // usage-global injects side-effect imports and leaves the identifier alone, so `Map++`
  // must polyfill - otherwise `Map` ReferenceError's in engines where the native is missing
  const skipUpdateTargets = method === 'usage-pure';
  let handledObjects = new WeakSet();
  let isSelfRefVarBinding = createSelfRefVarGuard(b => b.kind);

  function resolveKey(path, computed) {
    return sharedResolveKey(path.node, computed, path.scope, adapter);
  }

  function handleIdentifier(path) {
    // orphaned node (parent removed by a sibling transform): `isReferencedIdentifier`
    // reads `parent.type` unconditionally and would crash. check BEFORE everything else
    if (!path.parent) return;
    // babel classifies logical-assignment LHS as non-reference (write-context); diagnose
    // the `Map ||= X` pattern before the early return so users see why nothing polyfilled
    if (onWarning) {
      const warning = checkLogicalAssignLhsGlobal(path.node, path.parent,
        !!path.scope.getBindingIdentifier(path.node.name));
      if (warning) onWarning(warning);
    }
    if (!path.isReferencedIdentifier()) return;
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
    // TS type-only positions: `type X = …` / `interface X {…}` / `import type X = require(...)`
    // ids and `export { type X }` / `import type { X }` specifiers. babel's
    // `isReferencedIdentifier` marks them as referenced, but no runtime binding exists -
    // polyfilling is pure over-injection (and breaks TS output for exports / duplicates the
    // import LHS for TSImportEquals)
    if (isTSTypeOnlyIdentifierPath(path)) return;
    // UpdateExpression operand (Map++, --Map, Map!++, (Map)++) - gate see `skipUpdateTargets`
    if (skipUpdateTargets && isInUpdateOperand(path.parentPath)) return;
    const { node } = path;
    // adapter.hasBinding folds in two filters: skips type-only TSImportEquals (elided by
    // tsc - runtime resolves to global) and recognises plugin-managed bindings (pure-import
    // aliases, global destructure aliases). single check, parity with unplugin's visitor
    if (adapter.hasBinding(path.scope, node.name, path)) {
      // self-reference `var X = X` - hoisted var init references its own name, which at
      // runtime reads from the outer (global) scope before the local is assigned. narrow
      // path intentionally: ImportSpecifiers, class-decls, and const-to-identifier aliases
      // are excluded so user-owned pure imports (e.g. `const MyPromiseTry = …`) don't get
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
    // `globalThis.Map ||= X` - check BEFORE inner-identifier visit rewrites `globalThis`
    // into `_globalThis` (at which point `POSSIBLE_GLOBAL_OBJECTS.has(_globalThis)` is false)
    if (onWarning) {
      const obj = node.object;
      const isBound = obj?.type === 'Identifier' && adapter.hasBinding(path.scope, obj.name);
      const warning = checkLogicalAssignLhsMember(node, parent, isBound);
      if (warning) onWarning(warning);
    }
    if (handledObjects.has(node)) return;
    if (isMemberWriteOnlyContext(node, parent, path.parentPath?.parent)) return;
    const meta = handleMemberExpressionNode(node, path.scope, adapter, handledObjects, suppressProxyGlobals);
    if (meta) onUsage(meta, path);
  }

  // nested pattern `{ X: { y } } = Z` - inner ObjectPattern lives under an outer ObjectProperty.
  // N-deep: resolve the outer key chain to an effective receiver, emit meta accordingly
  function emitNestedDestructureMeta(path, outerProp) {
    const innerKey = sharedResolveKey(path.node.key, path.node.computed, path.scope, adapter);
    if (!innerKey) return;
    const receiverKey = resolveNestedDestructureReceiver(outerProp);
    onUsage(receiverKey !== null
      ? { kind: 'property', object: receiverKey, key: innerKey, placement: 'static' }
      : { kind: 'property', object: null, key: innerKey, placement: null }, path);
  }

  // walks up the outer property chain until a destructure host. returns the last (deepest)
  // outer key when every intermediate hop is itself a proxy-global name and the host's
  // receiver slot is a proxy-global. null -> caller emits typeless meta.
  // `self.Array.from` via nest -> 'Array'. hosts: VariableDeclarator (`const {Array:{from}} = G`),
  // AssignmentExpression (`({Array:{from}} = G)` in ExpressionStatement). AssignmentPattern
  // (function param default) is intentionally excluded - inline-default would pick native
  // first when present, contradicting usage-pure's "polyfill always wins" contract; user
  // must rewrite as `function f() { const from = _Array$from; ... }` instead
  function resolveNestedDestructureReceiver(outerProp) {
    const keys = [];
    let cur = outerProp;
    for (;;) {
      const pattern = cur.parentPath;
      if (!pattern?.isObjectPattern()) return null;
      const key = sharedResolveKey(cur.node.key, cur.node.computed, pattern.scope, adapter);
      if (!key) return null;
      keys.unshift(key);
      const parent = pattern.parentPath;
      // shared `flattenableHostSlot` returns 'init' for VariableDeclarator,
      // 'right' for AssignmentExpression-in-ExpressionStatement, null otherwise.
      // AssignmentPattern excluded (see helper docstring)
      const slot = flattenableHostSlot(parent?.node, parent);
      const receiverNode = slot ? parent.node[slot] : null;
      if (receiverNode !== null) {
        // `(se(), globalThis)` - peel to the semantic init value so nested chains resolve
        // the receiver through SequenceExpression prefixes. parity with non-nested
        // `handleDestructuring` which unwraps via `buildDestructuringInitMeta`
        const init = unwrapInitValue(receiverNode);
        const receiver = init ? sharedResolveObjectName(init, parent.scope, adapter) : null;
        if (!receiver || !POSSIBLE_GLOBAL_OBJECTS.has(receiver)) return null;
        // intermediate keys (everything except the deepest) must all be proxy-global hops,
        // otherwise the chain describes a user namespace and we can't polyfill
        if (!keys.slice(0, -1).every(k => POSSIBLE_GLOBAL_OBJECTS.has(k))) return null;
        return keys[keys.length - 1];
      }
      if (!parent?.isObjectProperty()) return null;
      cur = parent;
    }
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
    } else if (parent.isAssignmentPattern() && isFunctionParamDestructureParent(objectPattern)) {
      // `function({ from } = Array)` - AssignmentPattern wraps the param; the default
      // expression is the receiver that our destructure targets when the arg is omitted.
      // for IIFE with statically-classifiable caller-arg (`(({from} = Array) => ...)(Set)`),
      // wrapper-default is dead code at runtime - resolve against caller-arg instead.
      // narrowing to Identifier: only bare globals can be classified to a receiver type;
      // non-Identifier shapes (`(...)(globalThis.X)`, `(...)(call())`) carry no static type
      // info, so wrapper-default still provides the best static receiver context, and the
      // runtime fallback path (`= Array` fires on undefined caller-arg) gets the polyfill
      const key = resolveKey(path.get('key'), path.node.computed);
      if (!key) return;
      const argNode = findIifeArgForParam(parent.parentPath, parent.node);
      const receiverNode = isClassifiableReceiverArg(argNode) ? argNode : parent.node.right;
      const meta = buildDestructuringInitMeta(receiverNode, key, parent.scope, adapter);
      onUsage(meta, path);
      return;
    } else if (parent.isObjectProperty()) {
      emitNestedDestructureMeta(path, parent);
      return;
    } else if (parent.isAssignmentPattern()
      || parent.isForOfStatement()
      || parent.isForInStatement()
      || parent.isArrayPattern()
      || parent.isRestElement()
      || parent.isCatchClause()) {
      // for-of / array / catch: unknown receiver, emit typeless meta
      const key = resolveKey(path.get('key'), path.node.computed);
      if (key) onUsage({ kind: 'property', object: null, key, placement: null }, path);
      return;
    } else if (parent.isFunction()) {
      // IIFE: (({ from }) => {})(Array), !function ({ from }) {} (Array). also covers
      // TS-wrapped callees `((arrow) as any)(Array)` and ChainExpression-wrapped optional
      // call sites - peel mirrors `detectIifeArgPath`'s outer loop in the synth-swap stage
      const paramIndex = parent.node.params.indexOf(objectPattern.node);
      if (paramIndex === -1) return;
      let callPath = parent.parentPath;
      while (callPath?.isUnaryExpression() || callPath?.isSequenceExpression()
        || TS_EXPR_WRAPPERS.has(callPath?.node?.type)
        || callPath?.node?.type === 'ChainExpression') {
        callPath = callPath.parentPath;
      }
      if (callPath?.isCallExpression() || callPath?.isNewExpression() || callPath?.isOptionalCallExpression()) {
        const key = resolveKey(path.get('key'), path.node.computed);
        if (!key) return;
        const argNode = resolveCallArgument(callPath.node.arguments, paramIndex);
        const meta = buildDestructuringInitMeta(argNode ?? null, key, callPath.scope, adapter);
        onUsage(meta, path);
        return;
      }
      return;
    } else return;
    if (!initPath?.node) return;
    const key = resolveKey(path.get('key'), path.node.computed);
    if (!key) return;
    let meta = buildDestructuringInitMeta(initPath.node, key, initPath.scope, adapter);
    // follow memoized reference type (e.g., const _ref = [1,2,3] after memoization).
    // spread instead of in-place mutation: contract with buildDestructuringInitMeta
    // doesn't promise mutable meta, and a fresh object is cheap here
    if (!meta.placement && initPath.node.coreJSResolvedType) {
      meta = { ...meta, object: initPath.node.coreJSResolvedType, placement: 'prototype' };
    }
    onUsage(meta, path);
  }

  function handleBinaryExpression(path) {
    const meta = handleBinaryIn(path.node, path.scope, adapter, handledObjects, isEntryAvailable);
    if (meta) onUsage(meta, path);
  }

  // a name in `T` of `let x: T` is a polyfill candidate only if no local binding shadows it
  // (`class Map {}; let x: Map = ...` must NOT pull in es.map.constructor)
  const annotationGlobal = path => name => {
    // `hasBinding` returns true for free variables via `program.globals` (babel marks `Map`
    // there as soon as any Identifier visitor reads it, even when no local binds it).
    // use `getBindingIdentifier` instead - that returns only actual local binders
    if (path.scope?.getBindingIdentifier(name)) return;
    onUsage({ kind: 'global', name }, path);
  };
  return {
    ...walkAnnotations ? {
      // babel exposes methods as distinct node types (not MethodDefinition wrappers), so
      // their params/returnType/typeAnnotation need explicit visitor entries. otherwise
      // `class C { m(x: Foo): Bar {} }` misses Foo/Bar on babel while unplugin catches them
      // through the underlying FunctionExpression - parser divergence
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ClassMethod|ClassPrivateMethod|ObjectMethod'(path) {
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
    } : {},
    'ReferencedIdentifier|Identifier': handleIdentifier,
    'MemberExpression|OptionalMemberExpression': handleMemberExpression,
    ObjectProperty(path) {
      if (path.node.method) return;
      handleDestructuring(path);
    },
    BinaryExpression: handleBinaryExpression,
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
    CallExpression(path) {
      if (path.get('callee').isImport()) rules.onImportExpression(path.node);
    },
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
