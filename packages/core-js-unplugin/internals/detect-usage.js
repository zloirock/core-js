// detect polyfillable usage patterns (usage-global and usage-pure modes)
import {
  buildDestructuringInitMeta,
  checkTypeAnnotations,
  handleBinaryIn,
  handleMemberExpressionNode,
  resolveCallArgument,
  resolveKey as sharedResolveKey,
  walkTypeAnnotationGlobals,
} from '@core-js/polyfill-provider/detect-usage';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';
import { walkPatternIdentifiers } from '@core-js/polyfill-provider/helpers';

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
  if ((parent.type === 'LabeledStatement' || parent.type === 'BreakStatement'
    || parent.type === 'ContinueStatement') && parentKey === 'label') return false;
  if (parent.type === 'ImportAttribute' && parentKey === 'key') return false;
  if (parent.type === 'ImportSpecifier' || parent.type === 'ImportDefaultSpecifier'
    || parent.type === 'ImportNamespaceSpecifier') return false;
  if (parent.type === 'ExportSpecifier' && parentKey === 'exported') return false;
  if (parent.type === 'CatchClause' && parentKey === 'param') return false;
  if ((parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') && parentKey === 'left') return false;
  if (parent.type === 'AssignmentExpression' && parentKey === 'left') return false;
  // UpdateExpression operand (Map++, --Map) - read+write context, polyfill import is read-only
  // so the transform would emit `_Map++` which throws TypeError at runtime
  if (parent.type === 'UpdateExpression') return false;
  if (parent.type === 'ArrayPattern' || (parent.type === 'RestElement' && parentKey === 'argument')) return false;
  return true;
}

// ESTree scope adapter for shared detect-usage functions
export const estreeAdapter = {
  hasBinding: (scope, name) => scope?.hasBinding(name) ?? false,
  getBinding(scope, name) {
    const b = scope?.getBinding(name);
    if (!b) return null;
    // expose the source string for any import-bound binding (default/named/namespace) so
    // resolveKey() can recognise a polyfill UID and infer Symbol.<name> from it
    let importSource = null;
    const specType = b.path.node?.type;
    if (specType === 'ImportDefaultSpecifier' || specType === 'ImportSpecifier' || specType === 'ImportNamespaceSpecifier') {
      importSource = b.path.parent?.source?.value ?? b.path.parentPath?.node?.source?.value ?? null;
    }
    return { node: b.path.node, constantViolations: b.constantViolations, importSource };
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
  // nested patterns (Property/AssignmentPattern/For-of/For-in/ArrayPattern/RestElement) leave
  // `initNode` undefined: we can't track them to a specific init, so we build a typeless meta
  // (`object: null`) below so the polyfill machinery still sees the property name. Common case:
  // `const [{ from }] = [Array]`.
  switch (parent.node.type) {
    case 'VariableDeclarator': initNode = parent.node.init; break;
    case 'AssignmentExpression': initNode = parent.node.right; break;
    case 'AssignmentPattern':
    case 'ForOfStatement':
    case 'ForInStatement':
    case 'Property':
    case 'ArrayPattern':
    case 'RestElement': break;
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
            initNode = resolveCallArgument(callNode.arguments ?? [], paramIndex);
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

// estree-toolkit's visitor keys skip `decorators`. walk decorator subtrees manually with
// synthetic Babel-shaped paths so resolve-node-type can read locals' typeAnnotations (parity
// with babel-plugin, which gets real NodePaths from babel's own traverse)

const SKIP_KEYS = new Set(['type', 'loc', 'start', 'end', 'range']);
const FUNCTION_NODE_TYPES = new Set(['FunctionExpression', 'FunctionDeclaration', 'ArrowFunctionExpression']);

// iterate typed AST child values of `node`, skipping metadata keys
function forEachChildNode(node, visit) {
  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) continue;
    const value = node[key];
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) for (const child of value) visit(child, key);
    else if (typeof value === 'object' && typeof value.type === 'string') visit(value, key);
  }
}

// `get` returns NodePath[] for array fields to match babel's behaviour -
// `resolveArrayLiteralCommonType` does `path.get('elements')[i]`
function makeSynthPath(node, parent, parentKey, parentPath, scope) {
  const self = {
    node,
    parent,
    parentPath,
    key: parentKey,
    scope,
    get(key) {
      const value = node?.[key];
      if (Array.isArray(value)) return value.map((el, i) => makeSynthPath(el, node, i, self, scope));
      return makeSynthPath(value ?? null, node, key, self, scope);
    },
  };
  return self;
}

// frame scope for an inline function inside a decorator. locals shadow `parentScope` and
// their bindings are memoised so repeated `getBinding` calls reuse the same synth path
function makeFrameScope(parentScope, localDecls) {
  const bindingCache = new Map();
  const frame = {
    hasBinding: name => localDecls.has(name) || (parentScope?.hasBinding(name) ?? false),
    getBinding: name => {
      const local = localDecls.get(name);
      if (!local) return parentScope?.getBinding?.(name) ?? null;
      let binding = bindingCache.get(name);
      if (!binding) {
        binding = { constant: local.constant, path: makeSynthPath(local.node, null, null, null, frame) };
        bindingCache.set(name, binding);
      }
      return binding;
    },
  };
  return frame;
}

// walk `fnNode.body` once per function. result is cached so nested walks don't re-scan
// the same body when walkSubtree enters deeper into a closure
const LOCALS_CACHE = new WeakMap();
function collectFunctionLocals(fnNode) {
  const cached = LOCALS_CACHE.get(fnNode);
  if (cached) return cached;
  const locals = new Map();
  // params: the declarator is the param pattern itself (`function f(a: T)` -> a -> param),
  // marked constant so resolve-node-type follows `typeAnnotation` via constantBindingPath
  for (const param of fnNode.params || []) {
    walkPatternIdentifiers(param, id => locals.set(id.name, { constant: true, node: param }));
  }
  if (fnNode.id?.name) locals.set(fnNode.id.name, { constant: true, node: fnNode });
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (FUNCTION_NODE_TYPES.has(node.type)) return;
    if (node.type === 'VariableDeclaration') {
      const constant = node.kind === 'const';
      for (const d of node.declarations) {
        walkPatternIdentifiers(d.id, id => locals.set(id.name, { constant, node: d }));
      }
    } else if (node.type === 'ClassDeclaration' && node.id?.name) {
      locals.set(node.id.name, { constant: true, node });
    }
    forEachChildNode(node, walk);
  }
  if (fnNode.body) walk(fnNode.body);
  LOCALS_CACHE.set(fnNode, locals);
  return locals;
}

function walkSubtree(node, parent, parentKey, parentPath, scope, visitors) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
  const childScope = FUNCTION_NODE_TYPES.has(node.type)
    ? makeFrameScope(scope, collectFunctionLocals(node))
    : scope;
  const synthPath = makeSynthPath(node, parent, parentKey, parentPath, childScope);
  visitors[node.type]?.(synthPath);
  forEachChildNode(node, (child, key) => walkSubtree(child, node, key, synthPath, childScope, visitors));
}

function walkDecorators(parentPath, decoratorVisitors) {
  const decorators = parentPath.node?.decorators;
  if (!decorators?.length) return;
  for (const decorator of decorators) {
    walkSubtree(decorator, null, null, parentPath, parentPath.scope, decoratorVisitors);
  }
}

// the main usage visitor for estree-toolkit traverse
export function createUsageVisitors({ onUsage, suppressProxyGlobals = false, walkAnnotations = true }) {
  const handledObjects = new WeakSet();

  // skip user-shadowed names so `class Map {}; let x: Map = …` doesn't pull in es.map.constructor
  const annotationGlobal = path => name => {
    if (path.scope?.hasBinding(name)) return;
    onUsage({ kind: 'global', name }, path);
  };

  function checkTypeAnnotation(path) {
    checkTypeAnnotations(path.node, annotationGlobal(path));
  }

  function identifierVisitor(path) {
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
  }

  function memberExpressionVisitor(path) {
    const { node, parent, key: parentKey } = path;
    if (handledObjects.has(node)) return;
    // skip assignment targets - polyfilling LHS produces invalid code
    if (!isReferenced(node, parent, parentKey, path.parentPath?.parent?.type)) return;
    if (suppressProxyGlobals && parent?.type === 'BinaryExpression'
      && parent.operator === 'in' && parent.left === node) return;
    const meta = handleMemberExpressionNode(node, path.scope, estreeAdapter, handledObjects, suppressProxyGlobals);
    if (meta) onUsage(meta, path);
  }

  function binaryExpressionVisitor(path) {
    const meta = handleBinaryIn(path.node, path.scope, estreeAdapter, handledObjects, suppressProxyGlobals);
    if (meta) onUsage(meta, path);
  }

  // sub-traversal handlers for decorator expressions (not all main visitors apply here)
  const decoratorVisitors = {
    Identifier: identifierVisitor,
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
  };
  const visitDecorators = path => walkDecorators(path, decoratorVisitors);

  return {
    ...walkAnnotations ? {
      FunctionDeclaration: checkTypeAnnotation,
      FunctionExpression: checkTypeAnnotation,
      ArrowFunctionExpression: checkTypeAnnotation,
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
    Identifier: identifierVisitor,
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
    Property(path) {
      const { node } = path;
      if (node.method) return;
      if (path.parent?.type !== 'ObjectPattern') return;
      const meta = buildDestructuringMeta(node, path.parentPath);
      if (meta) onUsage(meta, path);
    },
    // estree-toolkit's traverse skips decorator children - drive a manual sub-walk on enter
    ClassDeclaration: visitDecorators,
    ClassExpression: visitDecorators,
    MethodDefinition: visitDecorators,
    PropertyDefinition: visitDecorators,
    AccessorProperty: visitDecorators,
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
