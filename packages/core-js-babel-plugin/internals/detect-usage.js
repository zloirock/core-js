import {
  buildDestructuringInitMeta,
  checkLogicalAssignLhsGlobal,
  checkTypeAnnotations,
  handleBinaryIn,
  handleMemberExpressionNode,
  resolveCallArgument,
  resolveKey as sharedResolveKey,
  walkTypeAnnotationGlobals,
} from '@core-js/polyfill-provider/detect-usage';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';
import { TS_EXPR_WRAPPERS } from '@core-js/polyfill-provider/helpers';

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
      if (scope.getBindingIdentifier(name)) return true;
      return !!getInjector()?.getPureImport(name);
    },
    getBinding(scope, name) {
      const b = scope.getBinding(name);
      if (b) {
        const importSource = IMPORT_SPECIFIER_TYPES.has(b.path.node?.type)
          ? b.path.parent?.source?.value ?? null : null;
        return { node: b.path.node, constantViolations: b.constantViolations, importSource, polyfillHint: null };
      }
      const pureImport = getInjector()?.getPureImport(name);
      if (!pureImport) return null;
      return { node: null, constantViolations: null, importSource: pureImport.source, polyfillHint: pureImport.hint };
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

export function createUsageVisitors({ onUsage, onWarning, adapter, suppressProxyGlobals = false, walkAnnotations = true }) {
  let handledObjects = new WeakSet();

  function resolveKey(path, computed) {
    return sharedResolveKey(path.node, computed, path.scope, adapter);
  }

  function handleIdentifier(path) {
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
    // UpdateExpression operand (Map++, --Map, Map!++) - read+write context, polyfill import
    // is read-only so the transform would emit `_Map++` which throws TypeError at runtime
    let updateCheck = path.parentPath;
    while (updateCheck && TS_EXPR_WRAPPERS.has(updateCheck.node?.type)) updateCheck = updateCheck.parentPath;
    if (updateCheck?.isUpdateExpression()) return;
    const { node } = path;
    if (path.scope.getBindingIdentifier(node.name)) return;
    if (handledObjects.has(node)) return;
    if (suppressProxyGlobals && (path.parentPath.isMemberExpression() || path.parentPath.isOptionalMemberExpression())
      && path.key === 'object') {
      const grandParent = path.parentPath.parent;
      if (grandParent?.type === 'BinaryExpression' && grandParent.operator === 'in'
        && grandParent.left === path.parent) return;
    }
    onUsage({ kind: 'global', name: node.name }, path);
  }

  function handleMemberExpression(path) {
    const { node } = path;
    if (handledObjects.has(node)) return;
    if (suppressProxyGlobals && path.parent.type === 'BinaryExpression'
      && path.parent.operator === 'in' && path.parent.left === node) return;
    const meta = handleMemberExpressionNode(node, path.scope, adapter, handledObjects, suppressProxyGlobals);
    if (meta) onUsage(meta, path);
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
    } else if (parent.isObjectProperty()
      || parent.isAssignmentPattern()
      || parent.isForOfStatement()
      || parent.isForInStatement()
      || parent.isArrayPattern()
      || parent.isRestElement()
      || parent.isCatchClause()) {
      // nested / for-of / array / catch: unknown receiver, emit typeless meta
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
    const meta = handleBinaryIn(path.node, path.scope, adapter, handledObjects, suppressProxyGlobals);
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
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path) {
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
    [USAGE_VISITORS_RESET]: () => { handledObjects = new WeakSet(); },
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
