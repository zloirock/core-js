// detect polyfillable usage patterns (usage-global and usage-pure modes)
import {
  buildDestructuringInitMeta,
  checkTypeAnnotations,
  handleBinaryIn,
  handleMemberExpressionNode,
  resolveKey as sharedResolveKey,
  walkTypeAnnotationGlobals,
} from '@core-js/polyfill-provider/detect-usage';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';

// check if an identifier is referenced (not a declaration, property key, or export alias)
function isReferenced(node, parent, parentKey, grandParentType) {
  if (!parent) return true;
  if (parent.type === 'Property' && parentKey === 'key' && !parent.computed) return false;
  // Property value inside ObjectPattern is a binding target, not a reference
  // { Promise } = obj -> Promise is written to, not read; but { x: Promise } in ObjectExpression IS read
  if (parent.type === 'Property' && parentKey === 'value' && grandParentType === 'ObjectPattern') return false;
  if (parent.type === 'MemberExpression' && parentKey === 'property' && !parent.computed) return false;
  if ((parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression'
    || parent.type === 'ClassDeclaration' || parent.type === 'ClassExpression'
    || parent.type === 'VariableDeclarator') && parentKey === 'id') return false;
  if ((parent.type === 'MethodDefinition' || parent.type === 'PropertyDefinition'
    || parent.type === 'AccessorProperty') && parentKey === 'key' && !parent.computed) return false;
  if (parent.type === 'LabeledStatement' && parentKey === 'label') return false;
  if (parent.type === 'ImportSpecifier' || parent.type === 'ImportDefaultSpecifier'
    || parent.type === 'ImportNamespaceSpecifier') return false;
  if (parent.type === 'ExportSpecifier' && parentKey === 'exported') return false;
  if (parent.type === 'CatchClause' && parentKey === 'param') return false;
  if ((parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') && parentKey === 'left') return false;
  if (parent.type === 'AssignmentExpression' && parentKey === 'left') return false;
  if (parent.type === 'ArrayPattern' || (parent.type === 'RestElement' && parentKey === 'argument')) return false;
  return true;
}

// ESTree scope adapter for shared detect-usage functions
export const estreeAdapter = {
  hasBinding: (scope, name) => scope?.hasBinding(name) ?? false,
  getBinding(scope, name) {
    const b = scope?.getBinding(name);
    if (!b) return null;
    return { node: b.path.node, constantViolations: b.constantViolations };
  },
  getBindingNodeType(scope, name) {
    return scope?.getBinding(name)?.path?.node?.type ?? null;
  },
  isStringLiteral: node => node?.type === 'Literal' && typeof node.value === 'string',
  getStringValue: node => (node?.type === 'Literal' && typeof node.value === 'string') ? node.value : null,
};

function resolveKey(node, computed, scope) {
  return sharedResolveKey(node, computed, scope, estreeAdapter);
}

// extract key from destructuring property
function extractPropertyKey(propNode, scope) {
  if (!propNode.computed) {
    return propNode.key.type === 'Identifier' ? propNode.key.name
      : estreeAdapter.isStringLiteral(propNode.key) ? propNode.key.value
        : null;
  }
  return resolveKey(propNode.key, true, scope);
}

// build meta for destructuring property: const { from } = Array, ({ from } = Array)
// parent traversal is ESTree-specific (parentPath), core resolution uses shared helpers
function buildDestructuringMeta(propNode, parentPath) {
  const objectPattern = parentPath;
  const parent = objectPattern?.parentPath;
  if (!parent) return null;

  let initNode;
  const scope = parent.scope || objectPattern.scope;
  switch (parent.node.type) {
    case 'VariableDeclarator': initNode = parent.node.init; break;
    case 'AssignmentExpression': initNode = parent.node.right; break;
    case 'AssignmentPattern':
    case 'ForOfStatement':
    case 'ForInStatement':
    case 'Property': break;
    default: {
      // IIFE destructuring: !function ({ entries }) {} (Object)
      const funcNode = parent.node;
      if (funcNode.type === 'FunctionExpression' || funcNode.type === 'ArrowFunctionExpression') {
        const paramIndex = funcNode.params?.indexOf(objectPattern.node);
        if (paramIndex >= 0) {
          let callPath = parent.parentPath;
          while (callPath?.node && (callPath.node.type === 'UnaryExpression'
            || callPath.node.type === 'SequenceExpression'
            || callPath.node.type === 'ParenthesizedExpression')) {
            callPath = callPath.parentPath;
          }
          const callNode = callPath?.node;
          if (callNode?.type === 'NewExpression' || callNode?.type === 'CallExpression') {
            initNode = callNode.arguments?.[paramIndex];
          }
        }
      }
      if (!initNode) return null;
    }
  }

  const key = extractPropertyKey(propNode, scope);
  if (!key) return null;
  return buildDestructuringInitMeta(initNode, key, scope, estreeAdapter);
}

// the main usage visitor for estree-toolkit traverse
export function createUsageVisitors({ onUsage, suppressProxyGlobals = false, walkAnnotations = true }) {
  const handledObjects = new WeakSet();

  function checkTypeAnnotation(path) {
    checkTypeAnnotations(path.node, name => onUsage({ kind: 'global', name }, path));
  }

  return {
    ...walkAnnotations ? {
      FunctionDeclaration: checkTypeAnnotation,
      FunctionExpression: checkTypeAnnotation,
      ArrowFunctionExpression: checkTypeAnnotation,
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
    Identifier(path) {
      const { node, parent, key: parentKey } = path;
      if (!isReferenced(node, parent, parentKey, path.parentPath?.parent?.type)) return;
      // re-export: export { Promise } from 'foo' - local is not a reference when source is present
      if (parent?.type === 'ExportSpecifier' && parentKey === 'local'
        && path.parentPath?.parentPath?.node?.source) return;
      if (path.scope?.hasBinding(node.name)) return;
      if (handledObjects.has(node)) return;
      if (suppressProxyGlobals && parent?.type === 'MemberExpression' && parentKey === 'object') {
        const grandParent = path.parentPath?.parentPath?.node;
        if (grandParent?.type === 'BinaryExpression' && grandParent.operator === 'in'
          && grandParent.left === parent) return;
      }
      onUsage({ kind: 'global', name: node.name }, path);
    },
    MemberExpression(path) {
      const { node } = path;
      if (handledObjects.has(node)) return;
      if (suppressProxyGlobals && path.parent?.type === 'BinaryExpression'
        && path.parent.operator === 'in' && path.parent.left === node) return;
      const meta = handleMemberExpressionNode(node, path.scope, estreeAdapter, handledObjects, suppressProxyGlobals);
      if (meta) onUsage(meta, path);
    },
    BinaryExpression(path) {
      const meta = handleBinaryIn(path.node, path.scope, estreeAdapter, handledObjects, suppressProxyGlobals);
      if (meta) onUsage(meta, path);
    },
    Property(path) {
      const { node } = path;
      if (node.method) return;
      if (path.parent?.type !== 'ObjectPattern') return;
      const meta = buildDestructuringMeta(node, path.parentPath);
      if (meta) onUsage(meta, path);
    },
  };
}

// syntax visitors - thin wrapper over shared createSyntaxRules
export function createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack = false }) {
  const rules = createSyntaxRules({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack });
  return {
    ImportExpression(path) { rules.onImportExpression(path.node); },
    FunctionDeclaration(path) { rules.onFunction(path.node); },
    FunctionExpression(path) { rules.onFunction(path.node); },
    ArrowFunctionExpression(path) { rules.onFunction(path.node); },
    ForOfStatement(path) { rules.onForOfStatement(path.node); },
    ArrayPattern(path) { rules.onArrayPattern(path.node); },
    SpreadElement(path) { rules.onSpreadElement(path.node, path.parent?.type); },
    YieldExpression(path) { rules.onYieldExpression(path.node); },
    VariableDeclaration(path) { rules.onVariableDeclaration(path.node); },
    ClassDeclaration(path) { rules.onClass(path.node); },
    ClassExpression(path) { rules.onClass(path.node); },
  };
}
