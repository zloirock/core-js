import {
  buildDestructuringInitMeta,
  checkTypeAnnotations,
  handleBinaryIn,
  handleMemberExpressionNode,
  resolveKey as sharedResolveKey,
  walkTypeAnnotationGlobals,
} from '@core-js/polyfill-provider/detect-usage';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';

// Babel scope adapter for shared detect-usage functions
export const babelAdapter = {
  hasBinding: (scope, name) => !!scope.getBindingIdentifier(name),
  getBinding(scope, name) {
    const b = scope.getBinding(name);
    if (!b) return null;
    return { node: b.path.node, constantViolations: b.constantViolations };
  },
  getBindingNodeType(scope, name) {
    return scope.getBinding(name)?.path.node?.type ?? null;
  },
  isStringLiteral: node => node?.type === 'StringLiteral',
  getStringValue: node => node?.type === 'StringLiteral' ? node.value : null,
};

function resolveKey(path, computed) {
  return sharedResolveKey(path.node, computed, path.scope, babelAdapter);
}

// usage detection visitors for Babel AST
export function createUsageVisitors({ onUsage, suppressProxyGlobals = false, walkAnnotations = true }) {
  const handledObjects = new WeakSet();

  function handleIdentifier(path) {
    if (!path.isReferencedIdentifier()) return;
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
    const meta = handleMemberExpressionNode(node, path.scope, babelAdapter, handledObjects, suppressProxyGlobals);
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
    } else if (parent.isObjectProperty() || parent.isAssignmentPattern()
      || parent.isForOfStatement() || parent.isForInStatement()) {
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
        const argNode = callPath.node.arguments[paramIndex];
        const meta = buildDestructuringInitMeta(argNode ?? null, key, callPath.scope, babelAdapter);
        onUsage(meta, path);
        return;
      }
      return;
    } else return;
    if (!initPath?.node) return;
    const key = resolveKey(path.get('key'), path.node.computed);
    if (!key) return;
    const meta = buildDestructuringInitMeta(initPath.node, key, initPath.scope, babelAdapter);
    // follow memoized reference type (e.g., const _ref = [1,2,3] after memoization)
    if (!meta.placement && initPath.node.coreJSResolvedType) {
      meta.object = initPath.node.coreJSResolvedType;
      meta.placement = 'prototype';
    }
    onUsage(meta, path);
  }

  function handleBinaryExpression(path) {
    const meta = handleBinaryIn(path.node, handledObjects, suppressProxyGlobals);
    if (meta) onUsage(meta, path);
  }

  return {
    ...walkAnnotations ? {
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path) {
        checkTypeAnnotations(path.node, name => onUsage({ kind: 'global', name }, path));
      },
      VariableDeclarator(path) {
        if (path.node.id?.typeAnnotation) {
          walkTypeAnnotationGlobals(path.node.id.typeAnnotation, name => onUsage({ kind: 'global', name }, path));
        }
      },
      CatchClause(path) {
        if (path.node.param?.typeAnnotation) {
          walkTypeAnnotationGlobals(path.node.param.typeAnnotation, name => onUsage({ kind: 'global', name }, path));
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
