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
  isFunctionParamDestructureParent,
  isTSTypeOnlyIdentifier,
} from '@core-js/polyfill-provider/helpers';

const IMPORT_SPECIFIER_TYPES = new Set([
  'ImportDefaultSpecifier',
  'ImportSpecifier',
  'ImportNamespaceSpecifier',
]);

const isStringLiteral = node => node?.type === 'StringLiteral';

// factory for a Babel scope adapter bound to a specific plugin-instance injector.
// the closure over `getInjector` avoids module-level mutable state, which would race
// under parallel transforms (Vite/Rollup/thread-loader)
export function createBabelAdapter(getInjector = () => null) {
  return {
    hasBinding(scope, name) {
      return !!scope.getBindingIdentifier(name) || !!getInjector()?.getBindingInfo(name);
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
    getStringValue: node => isStringLiteral(node) ? node.value : null,
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

export function createUsageVisitors({ onUsage, onWarning, adapter, suppressProxyGlobals = false, walkAnnotations = true }) {
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
    // ReferencedIdentifier matches JSXIdentifier in too many positions - only the direct
    // opening-element name is a runtime reference. Attribute names, JSXNamespacedName
    // (custom elements), and JSXMemberExpression parts are either not references or
    // resolve differently, so treating them as globals is a false positive
    if (path.node.type === 'JSXIdentifier'
      && (path.parent?.type !== 'JSXOpeningElement' || path.key !== 'name')) return;
    // TS type-only positions: `type X = …` / `interface X {…}` ids and `export { type X }`
    // specifiers. babel's `isReferencedIdentifier` marks them as referenced, but no runtime
    // binding exists - polyfilling is pure over-injection (and breaks TS output for exports)
    if (isTSTypeOnlyIdentifier(path.parent, path.key)) return;
    // UpdateExpression operand (Map++, --Map, Map!++, (Map)++) - read+write context, polyfill
    // import is read-only so the transform would emit `_Map++` which throws TypeError at runtime.
    // peel TS wrappers plus ParenthesizedExpression (parsed when `createParenthesizedExpressions: true`)
    let updateCheck = path.parentPath;
    while (updateCheck && (TS_EXPR_WRAPPERS.has(updateCheck.node?.type) || updateCheck.node?.type === 'ParenthesizedExpression')) {
      updateCheck = updateCheck.parentPath;
    }
    if (updateCheck?.isUpdateExpression()) return;
    const { node } = path;
    if (path.scope.getBindingIdentifier(node.name)) {
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
    const { node } = path;
    // `globalThis.Map ||= X` - check BEFORE inner-identifier visit rewrites `globalThis`
    // into `_globalThis` (at which point `POSSIBLE_GLOBAL_OBJECTS.has(_globalThis)` is false)
    if (onWarning) {
      const warning = checkLogicalAssignLhsMember(node, path.parent);
      if (warning) onWarning(warning);
    }
    if (handledObjects.has(node)) return;
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

  // walks up the outer property chain until a declarator. returns the last (deepest) outer
  // key when every intermediate hop is itself a proxy-global name and the declarator's init
  // is a proxy-global. null -> caller emits typeless meta. `self.Array.from` via nest -> 'Array'
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
      if (parent?.isVariableDeclarator()) {
        const { init } = parent.node;
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
    } else if (parent.isAssignmentPattern()
      && isFunctionParamDestructureParent(parent.node, parent.parentPath?.node, objectPattern.node)) {
      // `function({ from } = Array)` - AssignmentPattern wraps the param; the default
      // expression is the receiver that our destructure targets when the arg is omitted.
      // without this branch handleDestructuring emits typeless meta and loses the `Array`
      // linkage, so `from` never resolves to `Array.from`
      const key = resolveKey(path.get('key'), path.node.computed);
      if (!key) return;
      const meta = buildDestructuringInitMeta(parent.node.right, key, parent.scope, adapter);
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
      // IIFE: (({ from }) => {})(Array), !function ({ from }) {} (Array)
      const paramIndex = parent.node.params.indexOf(objectPattern.node);
      if (paramIndex === -1) return;
      let callPath = parent.parentPath;
      while (callPath?.isUnaryExpression() || callPath?.isSequenceExpression()) {
        callPath = callPath.parentPath;
      }
      if (callPath?.isCallExpression() || callPath?.isNewExpression()) {
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
    const meta = buildDestructuringInitMeta(initPath.node, key, initPath.scope, adapter);
    // follow memoized reference type (e.g., const _ref = [1,2,3] after memoization)
    if (!meta.placement && initPath.node.coreJSResolvedType) {
      meta.object = initPath.node.coreJSResolvedType;
      meta.placement = 'prototype';
    }
    onUsage(meta, path);
  }

  function handleBinaryExpression(path) {
    const meta = handleBinaryIn(path.node, path.scope, adapter, handledObjects);
    if (meta) onUsage(meta, path);
  }

  // a name in `T` of `let x: T` is a polyfill candidate only if no local binding shadows it
  // (`class Map {}; let x: Map = ...` must NOT pull in es.map.constructor)
  const annotationGlobal = path => name => {
    if (path.scope?.hasBinding(name)) return;
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
