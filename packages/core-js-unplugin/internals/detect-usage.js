// detect polyfillable usage patterns (usage-global and usage-pure modes)
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
import {
  TS_EXPR_WRAPPERS,
  isASTNode,
  isTSTypeOnlyIdentifier,
  unwrapParens,
  walkPatternIdentifiers,
} from '@core-js/polyfill-provider/helpers';

// --- isReferenced ---

const IMPORT_SPECIFIER_TYPES = new Set([
  'ImportSpecifier',
  'ImportDefaultSpecifier',
  'ImportNamespaceSpecifier',
]);

const DECLARATION_ID_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ClassDeclaration',
  'ClassExpression',
  'VariableDeclarator',
]);

const CLASS_MEMBER_TYPES = new Set([
  'MethodDefinition',
  'PropertyDefinition',
  'AccessorProperty',
]);

const LABEL_TYPES = new Set([
  'LabeledStatement',
  'BreakStatement',
  'ContinueStatement',
]);

// check if an identifier is referenced (not a declaration, property key, or export alias)
function isReferenced(node, parent, parentKey, parentPath) {
  if (!parent) return true;
  // TS type-only positions: `type X = …` ids, `export { type X }` specifiers
  if (isTSTypeOnlyIdentifier(parent, parentKey)) return false;
  // property key positions
  if (parent.type === 'Property' && parentKey === 'key' && !parent.computed) return false;
  if (parent.type === 'MemberExpression' && parentKey === 'property' && !parent.computed) return false;
  if (CLASS_MEMBER_TYPES.has(parent.type) && parentKey === 'key' && !parent.computed) return false;
  if (parent.type === 'ImportAttribute' && parentKey === 'key') return false;
  // declaration id positions
  if (DECLARATION_ID_TYPES.has(parent.type) && parentKey === 'id') return false;
  if (LABEL_TYPES.has(parent.type) && parentKey === 'label') return false;
  // `IMPORT_SPECIFIER_TYPES` skips all import positions regardless of `importKind`, so
  // `import { type X, foo }` / `import type { X }` are already covered here
  if (IMPORT_SPECIFIER_TYPES.has(parent.type)) return false;
  if (parent.type === 'ExportSpecifier' && parentKey === 'exported') return false;
  // binding targets - write-only, not a polyfillable reference
  // { Promise } = obj -> written to; { x: Promise } in ObjectExpression IS read
  if (parent.type === 'Property' && parentKey === 'value' && parentPath?.parent?.type === 'ObjectPattern') return false;
  if (parent.type === 'AssignmentExpression' && parentKey === 'left') return false;
  if (parent.type === 'CatchClause' && parentKey === 'param') return false;
  if ((parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') && parentKey === 'left') return false;
  if (parent.type === 'ArrayPattern' || (parent.type === 'RestElement' && parentKey === 'argument')) return false;
  // UpdateExpression operand (Map++, (Map as T)!++) - read+write context,
  // polyfill import is read-only so `_Map++` would throw TypeError at runtime.
  // oxc preserves `ParenthesizedExpression` around TS wrappers, so walk-up skips both
  if (parent.type === 'UpdateExpression') return false;
  if (isUpdateWrapper(parent)) {
    let check = parentPath;
    while (check && isUpdateWrapper(check.node)) check = check.parentPath;
    if (check?.node?.type === 'UpdateExpression') return false;
  }
  return true;
}

// walk-up classes for UpdateExpression detection through TS wrappers + parser-preserved parens
function isUpdateWrapper(node) {
  return !!node && (TS_EXPR_WRAPPERS.has(node.type) || node.type === 'ParenthesizedExpression');
}

// --- ESTree scope adapter ---

export const estreeAdapter = {
  hasBinding: (scope, name) => scope?.hasBinding(name) ?? false,
  getBinding(scope, name) {
    const b = scope?.getBinding(name);
    if (!b) return null;
    // expose source for import bindings so resolveKey() can infer Symbol.<name>
    let importSource = null;
    if (IMPORT_SPECIFIER_TYPES.has(b.path.node?.type)) {
      importSource = b.path.parent?.source?.value ?? null;
    }
    return { node: b.path.node, constantViolations: b.constantViolations, importSource };
  },
  getBindingNodeType: (scope, name) => scope?.getBinding(name)?.path?.node?.type ?? null,
  // oxc-parser preserves `ParenthesizedExpression`; unwrap so `require(('x'))` /
  // `import(('x'))` survive the ESTree->string translation
  isStringLiteral: node => isLiteralString(unwrapParens(node)),
  getStringValue: node => {
    const inner = unwrapParens(node);
    return isLiteralString(inner) ? inner.value : null;
  },
};

const isLiteralString = node => node?.type === 'Literal' && typeof node.value === 'string';

function resolveKey(node, computed, scope) {
  return sharedResolveKey(node, computed, scope, estreeAdapter);
}

// --- Destructuring ---

function extractPropertyKey(propNode, scope) {
  if (!propNode.computed) {
    return propNode.key.type === 'Identifier' ? propNode.key.name
      : estreeAdapter.isStringLiteral(propNode.key) ? propNode.key.value
        : null;
  }
  return resolveKey(propNode.key, true, scope);
}

// build meta for destructuring property: const { from } = Array, ({ from } = Array)
function buildDestructuringMeta(propNode, parentPath) {
  const objectPattern = parentPath;
  const parent = objectPattern?.parentPath;
  if (!parent) return null;

  let initNode;
  const scope = parent.scope || objectPattern.scope;
  // nested patterns leave `initNode` undefined -> typeless meta (`object: null`)
  switch (parent.node.type) {
    case 'VariableDeclarator': initNode = parent.node.init; break;
    case 'AssignmentExpression': initNode = parent.node.right; break;
    case 'AssignmentPattern':
    case 'ForOfStatement':
    case 'ForInStatement':
    case 'Property':
    case 'ArrayPattern':
    case 'RestElement':
    case 'CatchClause': break;
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

// --- Decorator sub-traversal ---

// estree-toolkit's visitor keys skip `decorators` - walk them manually with
// synthetic Babel-shaped paths so resolve-node-type can read typeAnnotations

const FUNCTION_NODE_TYPES = new Set(['FunctionExpression', 'FunctionDeclaration', 'ArrowFunctionExpression']);

// `isASTNode` drops parent back-pointers, location objects, and primitives without listing
// them by name; tolerates parsers adding new metadata fields (e.g. `typeArguments`).
// `visit(child, key, listKey, container)` matches babel NodePath shape: for array children
// `key` = index, `listKey` = property name; for non-array `key` = property name, `listKey` = null
function forEachChildNode(node, visit) {
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) if (isASTNode(value[i])) visit(value[i], i, key, value);
    } else if (isASTNode(value)) visit(value, key, null, node);
  }
}

// babel NodePath parity: for array-indexed children `key` = numeric index, `listKey` =
// property name, `container` = the array; for non-array children `key` = property name,
// `listKey` = null, `container` = parent node. consumers like `getStatementSiblings` rely
// on numeric key + listKey to recognise statement-in-block position
function makeSynthPath(node, parent, parentKey, parentPath, scope, listKey = null, container = null) {
  const self = {
    node,
    parent,
    parentPath,
    key: parentKey,
    listKey,
    container: container ?? parent,
    scope,
    get(key) {
      const value = node?.[key];
      if (Array.isArray(value)) return value.map((el, i) => makeSynthPath(el, node, i, self, scope, key, value));
      return makeSynthPath(value ?? null, node, key, self, scope, null, node);
    },
  };
  return self;
}

// frame scope for an inline function inside a decorator - locals shadow parentScope
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

const LOCALS_CACHE = new WeakMap();

function collectFunctionLocals(fnNode) {
  const cached = LOCALS_CACHE.get(fnNode);
  if (cached) return cached;
  const locals = new Map();
  // params marked constant so resolve-node-type follows typeAnnotation
  for (const param of fnNode.params || []) {
    walkPatternIdentifiers(param, id => locals.set(id.name, { constant: true, node: param }));
  }
  if (fnNode.id?.name) locals.set(fnNode.id.name, { constant: true, node: fnNode });
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    // hoisted `function foo()` binds in the enclosing function scope; register the
    // name, then skip the body (new scope) as with any function-like
    if (node.type === 'FunctionDeclaration') {
      if (node.id?.name) locals.set(node.id.name, { constant: true, node });
      return;
    }
    if (FUNCTION_NODE_TYPES.has(node.type)) return;
    if (node.type === 'VariableDeclaration') {
      const constant = node.kind === 'const';
      for (const d of node.declarations) {
        walkPatternIdentifiers(d.id, id => locals.set(id.name, { constant, node: d }));
      }
    } else if (node.type === 'ClassDeclaration' && node.id?.name) {
      locals.set(node.id.name, { constant: true, node });
    } else if (node.type === 'CatchClause' && node.param) {
      // catch-binding is block-scoped but close enough: flat frame-locals only need
      // "does this name shadow the global" for polyfill-lookup suppression
      walkPatternIdentifiers(node.param, id => locals.set(id.name, { constant: false, node: node.param }));
    }
    forEachChildNode(node, walk);
  }
  if (fnNode.body) walk(fnNode.body);
  LOCALS_CACHE.set(fnNode, locals);
  return locals;
}

function walkSubtree(node, parent, parentKey, parentPath, scope, visitors, listKey = null, container = null) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
  const childScope = FUNCTION_NODE_TYPES.has(node.type)
    ? makeFrameScope(scope, collectFunctionLocals(node))
    : scope;
  const synthPath = makeSynthPath(node, parent, parentKey, parentPath, childScope, listKey, container);
  visitors[node.type]?.(synthPath);
  forEachChildNode(node, (child, childKey, childListKey, childContainer) => {
    walkSubtree(child, node, childKey, synthPath, childScope, visitors, childListKey, childContainer);
  });
}

function walkDecoratorList(decorators, parentPath, decoratorVisitors) {
  if (!decorators?.length) return;
  for (let i = 0; i < decorators.length; i++) {
    walkSubtree(decorators[i], parentPath.node, i, parentPath, parentPath.scope, decoratorVisitors, 'decorators', decorators);
  }
}

// walks the node's own decorators plus any param-level decorators (TS legacy `@dec arg`
// on class method / constructor params). `MethodDefinition.params` lives on `.value`
function walkDecorators(parentPath, decoratorVisitors) {
  const { node } = parentPath;
  walkDecoratorList(node?.decorators, parentPath, decoratorVisitors);
  const params = node?.params ?? node?.value?.params;
  if (!params) return;
  for (const param of params) walkDecoratorList(param?.decorators, parentPath, decoratorVisitors);
}

// --- Usage visitors ---

export function createUsageVisitors({ onUsage, onWarning, suppressProxyGlobals = false, walkAnnotations = true }) {
  const handledObjects = new WeakSet();

  const annotationGlobal = path => name => {
    if (path.scope?.hasBinding(name)) return;
    onUsage({ kind: 'global', name }, path);
  };

  function identifierVisitor(path) {
    const { node, parent, key: parentKey } = path;
    // `isReferenced` returns false for write-context leaves like `Map ||= X`; diagnose the
    // pattern before the early return so users see why nothing was polyfilled
    if (onWarning) {
      const warning = checkLogicalAssignLhsGlobal(node, parent, path.scope?.hasBinding(node.name) ?? false);
      if (warning) onWarning(warning);
    }
    if (!isReferenced(node, parent, parentKey, path.parentPath)) return;
    // re-export: export { Promise } from 'foo' - local is not a reference when source is present
    if (parent?.type === 'ExportSpecifier' && parentKey === 'local'
      && path.parentPath?.parentPath?.node?.source) return;
    if (path.scope?.hasBinding(node.name)) return;
    // see `handleBinaryIn` - only resolved polyfillable keys seed `handledObjects`
    if (handledObjects.has(node)) return;
    onUsage({ kind: 'global', name: node.name }, path);
  }

  function memberExpressionVisitor(path) {
    const { node, parent, key: parentKey } = path;
    if (handledObjects.has(node)) return;
    if (!isReferenced(node, parent, parentKey, path.parentPath)) return;
    const meta = handleMemberExpressionNode(node, path.scope, estreeAdapter, handledObjects, suppressProxyGlobals);
    if (meta) onUsage(meta, path);
  }

  function binaryExpressionVisitor(path) {
    const meta = handleBinaryIn(path.node, path.scope, estreeAdapter, handledObjects);
    if (meta) onUsage(meta, path);
  }

  const decoratorVisitors = {
    Identifier: identifierVisitor,
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
  };
  const visitDecorators = path => walkDecorators(path, decoratorVisitors);
  const checkTypeAnnotation = path => checkTypeAnnotations(path.node, annotationGlobal(path));

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
    // `<Map />` tag-name is a runtime reference to a global constructor. skip attribute
    // names, namespaced/member parts, and closing-tag dupes so we emit the import once
    JSXIdentifier(path) {
      if (path.parent?.type !== 'JSXOpeningElement' || path.key !== 'name') return;
      if (path.scope?.hasBinding(path.node.name)) return;
      onUsage({ kind: 'global', name: path.node.name }, path);
    },
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
    Property(path) {
      if (path.node.method || path.parent?.type !== 'ObjectPattern') return;
      const meta = buildDestructuringMeta(path.node, path.parentPath);
      if (meta) onUsage(meta, path);
    },
    ClassDeclaration: visitDecorators,
    ClassExpression: visitDecorators,
    MethodDefinition: visitDecorators,
    PropertyDefinition: visitDecorators,
    AccessorProperty: visitDecorators,
  };
}

// --- Syntax visitors ---

export function createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack = false }) {
  const rules = createSyntaxRules({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack });
  const onFunction = path => rules.onFunction(path.node);
  const onClass = path => rules.onClass(path.node);
  return {
    ImportExpression(path) { rules.onImportExpression(path.node); },
    FunctionDeclaration: onFunction,
    FunctionExpression: onFunction,
    ArrowFunctionExpression: onFunction,
    ForOfStatement(path) { rules.onForOfStatement(path.node); },
    ArrayPattern(path) { rules.onArrayPattern(path.node); },
    SpreadElement(path) { rules.onSpreadElement(path.node, path.parent?.type); },
    YieldExpression(path) { rules.onYieldExpression(path.node); },
    VariableDeclaration(path) { rules.onVariableDeclaration(path.node); },
    ClassDeclaration: onClass,
    ClassExpression: onClass,
  };
}
