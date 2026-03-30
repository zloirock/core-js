// Detect polyfillable usage patterns (usage-global and usage-pure modes)
// Replicates @babel/helper-define-polyfill-provider's usage visitor + custom syntax visitors

import { POSSIBLE_GLOBAL_OBJECTS } from '@core-js/polyfill-provider';

function isStaticPlacement(objectName) {
  // If the object is a known global proxy or starts with uppercase (constructor), it's static
  if (POSSIBLE_GLOBAL_OBJECTS.has(objectName)) return 'static';
  if (objectName[0] >= 'A' && objectName[0] <= 'Z') return 'static';
  return null;
}

// Check if an identifier is referenced (not a declaration or property key)
function isReferenced(node, parent, parentKey) {
  if (!parent) return true;
  // Non-computed property key
  if (parent.type === 'Property' && parentKey === 'key' && !parent.computed) return false;
  if (parent.type === 'MemberExpression' && parentKey === 'property' && !parent.computed) return false;
  // Declaration identifiers
  if ((parent.type === 'FunctionDeclaration' || parent.type === 'ClassDeclaration'
    || parent.type === 'VariableDeclarator') && parentKey === 'id') return false;
  // Function parameters
  if ((parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression'
    || parent.type === 'ArrowFunctionExpression') && parentKey === 'params') return false;
  // Labels
  if (parent.type === 'LabeledStatement' && parentKey === 'label') return false;
  // Import specifiers
  if (parent.type === 'ImportSpecifier' || parent.type === 'ImportDefaultSpecifier'
    || parent.type === 'ImportNamespaceSpecifier') return false;
  // Catch clause param
  if (parent.type === 'CatchClause' && parentKey === 'param') return false;
  // for-in/for-of left
  if ((parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') && parentKey === 'left') return false;
  return true;
}

// Resolve object name from a member expression's object part
// Resolve a bound identifier to its global name, or null if it's a local/imported value
function resolveBindingToGlobal(name, scope) {
  const binding = scope.getBinding(name);
  const bindingType = binding?.path?.node?.type;
  // import X from '...', import { X } from '...', import * as X from '...'
  if (bindingType === 'ImportSpecifier' || bindingType === 'ImportDefaultSpecifier'
    || bindingType === 'ImportNamespaceSpecifier') return null;
  // const X = <expr> - follow if init is a bare identifier (alias), skip if init is a call/complex expression
  if (bindingType === 'VariableDeclarator') {
    const { init } = binding.path.node;
    if (binding.constantViolations?.length) return null;
    if (init?.type === 'Identifier' && !scope.hasBinding(init.name)) return init.name;
    if (init) return null;
  }
  // Param/binding with same name as known global - treat as potential global
  // Matches babel provider behavior: function test(JSON) { JSON.stringify(...) } still polyfills
  return isStaticPlacement(name) ? name : null;
}

function isImportBinding(name, scope) {
  if (!scope?.hasBinding(name)) return false;
  const bindingType = scope.getBinding(name)?.path?.node?.type;
  return bindingType === 'ImportSpecifier' || bindingType === 'ImportDefaultSpecifier'
    || bindingType === 'ImportNamespaceSpecifier';
}

function resolveObjectName(objectNode, scope) {
  if (objectNode.type === 'Identifier') {
    if (scope && scope.hasBinding(objectNode.name)) return resolveBindingToGlobal(objectNode.name, scope);
    return objectNode.name;
  }
  // globalThis.Array, self.Promise - resolve through global proxy chain
  if (objectNode.type === 'MemberExpression' && !objectNode.computed
    && objectNode.object.type === 'Identifier'
    && POSSIBLE_GLOBAL_OBJECTS.has(objectNode.object.name)
    && objectNode.property.type === 'Identifier') {
    return objectNode.property.name;
  }
  if (objectNode.type === 'ThisExpression') return null;
  return null;
}

// Build a meta object from a member expression
function resolveComputedKey(node, scope) {
  // Direct string literal: Array["from"]
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  // Const variable with string literal init: const key = "from"; Array[key]
  if (node.type === 'Identifier' && scope) {
    const binding = scope.getBinding(node.name);
    if (binding && !binding.constantViolations?.length && binding.path?.node?.type === 'VariableDeclarator') {
      const { init } = binding.path.node;
      if (init?.type === 'Literal' && typeof init.value === 'string') return init.value;
    }
  }
  // String concatenation: 'o' + 'f' -> 'of'
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = resolveComputedKey(node.left, scope);
    const right = resolveComputedKey(node.right, scope);
    if (left !== null && right !== null) return left + right;
  }
  return null;
}

function buildMemberMeta(node, scope) {
  if (node.computed) {
    const resolved = resolveComputedKey(node.property, scope);
    if (!resolved) return null;
    const objectName = resolveObjectName(node.object, scope);
    return {
      kind: 'property',
      object: objectName,
      key: resolved,
      placement: objectName ? isStaticPlacement(objectName) : 'prototype',
    };
  }
  const key = node.property.name || node.property.value;
  if (!key) return null;
  // Array.prototype.includes -> treat as instance access on Array
  if (node.object.type === 'MemberExpression' && !node.object.computed
    && node.object.property.type === 'Identifier' && node.object.property.name === 'prototype'
    && node.object.object.type === 'Identifier') {
    const proto = node.object.object.name;
    if (!scope?.hasBinding(proto) || isStaticPlacement(proto)) {
      return { kind: 'property', object: proto, key, placement: 'prototype' };
    }
  }
  const objectName = resolveObjectName(node.object, scope);
  // Skip polyfilling on import-bound objects: import arr from './x'; arr.flat() should not polyfill
  if (!objectName && node.object.type === 'Identifier' && isImportBinding(node.object.name, scope)) return null;
  const placement = objectName ? isStaticPlacement(objectName) : 'prototype';
  return {
    kind: 'property',
    object: objectName,
    key,
    placement,
  };
}

function extractPropertyKey(propNode, scope) {
  if (!propNode.computed) {
    return propNode.key.type === 'Identifier' ? propNode.key.name
      : (propNode.key.type === 'Literal' && typeof propNode.key.value === 'string') ? propNode.key.value
        : null;
  }
  return resolveComputedKey(propNode.key, scope);
}

// Build meta for destructuring property: const { from } = Array, ({ from } = Array)
function buildDestructuringMeta(propNode, parentPath) {
  const objectPattern = parentPath;
  const parent = objectPattern?.parentPath;
  if (!parent) return null;

  let initNode;
  const scope = parent.scope || objectPattern.scope;
  switch (parent.node.type) {
    case 'VariableDeclarator': initNode = parent.node.init; break;
    case 'AssignmentExpression': initNode = parent.node.right; break;
    case 'AssignmentPattern': initNode = parent.node.right; break;
    case 'ForOfStatement': case 'ForInStatement': break; // no init - resolved later by enhanceMeta
    case 'Property':
      // Nested destructuring: const { foo: { filter } } = { foo: [] }
      // ObjectPattern is the value of a parent Property inside an outer ObjectPattern
      // Emit with null object - type resolved later by enhanceMeta
      break;
    default: {
      // IIFE destructuring: !function ({ entries }) {} (Object), (({ includes }) => { })('42')
      // ObjectPattern is a function param, argument comes from the call expression
      const funcNode = parent.node;
      if (funcNode.type === 'FunctionExpression' || funcNode.type === 'ArrowFunctionExpression') {
        const paramIndex = funcNode.params?.indexOf(objectPattern.node);
        if (paramIndex >= 0) {
          const grandParent = parent.parentPath;
          let callPath = grandParent;
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

  // No init (e.g., for-of: `for (const { name } of arr)`) - emit with null object,
  // type will be resolved later by enhanceMeta via resolvePropertyObjectType
  if (!initNode) return { kind: 'property', object: null, key, placement: null };

  // Non-identifier init - try to derive type hint from literal type
  // (({ includes }) => { })('42') - string literal arg -> hint 'string'
  if (initNode.type !== 'Identifier') {
    if (initNode.type === 'Literal' && typeof initNode.value === 'string') {
      return { kind: 'property', object: 'string', key, placement: 'prototype' };
    }
    return { kind: 'property', object: null, key, placement: null };
  }

  const resolvedName = scope && scope.hasBinding(initNode.name)
    ? resolveBindingToGlobal(initNode.name, scope)
    : initNode.name;
  if (!resolvedName) return { kind: 'property', object: null, key, placement: null };
  return { kind: 'property', object: resolvedName, key, placement: isStaticPlacement(resolvedName) };
}

// Walk TS type annotations to find global type references (Promise, Map, Set, etc.)
// estree-toolkit doesn't traverse TS type nodes, but Babel does
function walkTypeAnnotationGlobals(annotation, onUsage, path) {
  if (!annotation) return;
  const stack = [annotation];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    // TSTypeReference with Identifier typeName -> global type usage
    if (node.type === 'TSTypeReference' && node.typeName?.type === 'Identifier') {
      onUsage({ kind: 'global', name: node.typeName.name }, path);
    }
    // Recurse into child type nodes
    for (const key of ['typeAnnotation', 'types', 'elementType', 'objectType', 'indexType',
      'checkType', 'extendsType', 'trueType', 'falseType', 'constraint', 'default',
      'typeArguments', 'typeParameters', 'returnType', 'params']) {
      const child = node[key];
      if (Array.isArray(child)) for (const c of child) stack.push(c);
      else if (child && typeof child === 'object') stack.push(child);
    }
  }
}

// The main usage visitor for estree-toolkit traverse
export function createUsageVisitors(onUsage, { suppressProxyGlobals = false, walkAnnotations = true } = {}) {
  // Track objects of handled member expressions to suppress duplicate global detection
  const handledObjects = new WeakSet();

  // Walk type annotations on nodes that estree-toolkit visits but doesn't descend into TS types
  function checkTypeAnnotation(path) {
    const { node } = path;
    // Node's own type annotation
    if (node.typeAnnotation) walkTypeAnnotationGlobals(node.typeAnnotation, onUsage, path);
    if (node.returnType) walkTypeAnnotationGlobals(node.returnType, onUsage, path);
    // Function parameter annotations
    if (node.params) {
      for (const param of node.params) {
        const p = param.type === 'AssignmentPattern' ? param.left : param;
        if (p.typeAnnotation) walkTypeAnnotationGlobals(p.typeAnnotation, onUsage, path);
      }
    }
    // Function/class type parameters
    if (node.typeParameters?.params) {
      for (const p of node.typeParameters.params) {
        if (p.constraint) walkTypeAnnotationGlobals(p.constraint, onUsage, path);
        if (p.default) walkTypeAnnotationGlobals(p.default, onUsage, path);
      }
    }
    // extends clauses on interfaces/classes with type args
    if (node.superTypeParameters) walkTypeAnnotationGlobals(node.superTypeParameters, onUsage, path);
  }

  return {
    // Walk TS type annotations on various declaration nodes (usage-global only)
    // In usage-pure, type annotations are skipped (no polyfill injection for type-only references)
    ...walkAnnotations ? {
      FunctionDeclaration: checkTypeAnnotation,
      FunctionExpression: checkTypeAnnotation,
      ArrowFunctionExpression: checkTypeAnnotation,
      VariableDeclarator(path) {
        if (path.node.id?.typeAnnotation) walkTypeAnnotationGlobals(path.node.id.typeAnnotation, onUsage, path);
      },
      CatchClause(path) {
        if (path.node.param?.typeAnnotation) walkTypeAnnotationGlobals(path.node.param.typeAnnotation, onUsage, path);
      },
    } : {},
    Identifier(path) {
      const { node } = path;
      const { parent } = path;
      const parentKey = path.key;
      if (!isReferenced(node, parent, parentKey)) return;
      // Skip if locally bound
      if (path.scope?.hasBinding(node.name)) return;
      // Skip member expression property
      if (parent?.type === 'MemberExpression' && parentKey === 'property') return;
      // Skip if this identifier was already handled as a member expression object (e.g., Symbol in Symbol.dispose)
      if (handledObjects.has(node)) return;
      // In pure mode, skip Symbol when it's part of `Symbol.X in obj` - handled by BinaryExpression -> isIterable
      if (suppressProxyGlobals && parent?.type === 'MemberExpression' && parentKey === 'object') {
        const grandParent = path.parentPath?.parentPath?.node;
        if (grandParent?.type === 'BinaryExpression' && grandParent.operator === 'in' && grandParent.left === parent) return;
      }
      onUsage({ kind: 'global', name: node.name }, path);
    },
    MemberExpression(path) {
      const { node } = path;
      if (handledObjects.has(node)) return;
      // In pure mode, skip Symbol.X when it's the left side of `in` (handled by BinaryExpression -> isIterable)
      if (suppressProxyGlobals && path.parent?.type === 'BinaryExpression'
        && path.parent.operator === 'in' && path.parent.left === node) return;
      // foo[Symbol.iterator] -> meta with key='Symbol.iterator'
      if (node.computed && node.property?.type === 'MemberExpression'
        && node.property.object?.type === 'Identifier' && node.property.object.name === 'Symbol'
        && node.property.property?.type === 'Identifier') {
        onUsage({
          kind: 'property',
          object: null,
          key: `Symbol.${ node.property.property.name }`,
          placement: 'prototype',
        }, path);
        if (!path.scope?.hasBinding('Symbol')) handledObjects.add(node.property.object);
        return;
      }
      const meta = buildMemberMeta(node, path.scope);
      if (meta) {
        onUsage(meta, path);
        // Mark object as handled so Identifier visitor skips it (e.g., Symbol in Symbol.dispose)
        // In pure mode, suppress global proxies too (globalThis/self/window/global are replaced, not polyfilled)
        // In global mode, proxies should still trigger their own polyfill (e.g., globalThis needs es.global-this)
        if (path.node.object.type === 'Identifier'
          && (suppressProxyGlobals || !POSSIBLE_GLOBAL_OBJECTS.has(path.node.object.name))) {
          handledObjects.add(path.node.object);
        }
        // Mark inner global proxy chain as handled: self.Promise.resolve -> mark self.Promise node and self Identifier
        // so neither MemberExpression nor Identifier visitor fires a separate global emission
        if (suppressProxyGlobals && node.object.type === 'MemberExpression'
          && node.object.object.type === 'Identifier'
          && POSSIBLE_GLOBAL_OBJECTS.has(node.object.object.name)) {
          handledObjects.add(node.object);
          handledObjects.add(node.object.object);
        }
      }
    },
    BinaryExpression(path) {
      const { node } = path;
      if (node.operator !== 'in') return;
      // Symbol.iterator in obj
      if (node.left.type === 'MemberExpression'
        && node.left.object.type === 'Identifier'
        && node.left.object.name === 'Symbol'
        && node.left.property.type === 'Identifier') {
        onUsage({
          kind: 'in',
          key: `Symbol.${ node.left.property.name }`,
          object: null,
          placement: null,
        }, path);
        // Suppress MemberExpression visitor for the Symbol.X left side
        handledObjects.add(node.left);
        handledObjects.add(node.left.object);
      }
    },
    Property(path) {
      // Destructuring: const { from } = Array, const { ['of']: x } = Array
      const { node } = path;
      if (node.method) return;
      const { parent } = path;
      if (parent?.type !== 'ObjectPattern') return;
      const meta = buildDestructuringMeta(node, path.parentPath);
      if (meta) onUsage(meta, path);
    },
  };
}

// Syntax visitors for usage-global mode (async/generators/for-of/spread/using/decorators)
export function createSyntaxVisitors(injectModulesForModeEntry, injectModulesForEntry, getUtils, isDisabled, { isWebpack = false } = {}) {
  return {
    ImportExpression(path) {
      if (isDisabled(path.node)) return;
      // Webpack wraps dynamic import in Promise.all
      injectModulesForModeEntry(isWebpack ? 'promise/all' : 'promise/constructor');
    },
    FunctionDeclaration: functionVisitor,
    FunctionExpression: functionVisitor,
    ArrowFunctionExpression: functionVisitor,
    ForOfStatement(path) {
      if (isDisabled(path.node)) return;
      injectModulesForModeEntry('symbol/iterator');
      if (path.node.await) {
        injectModulesForModeEntry('symbol/async-iterator');
      }
    },
    ArrayPattern(path) {
      if (isDisabled(path.node)) return;
      injectModulesForModeEntry('symbol/iterator');
    },
    SpreadElement(path) {
      if (isDisabled(path.node)) return;
      if (path.parent?.type !== 'ObjectExpression') {
        injectModulesForModeEntry('symbol/iterator');
      }
    },
    YieldExpression(path) {
      if (isDisabled(path.node)) return;
      if (path.node.delegate) {
        injectModulesForModeEntry('symbol/iterator');
      }
    },
    VariableDeclaration(path) {
      if (isDisabled(path.node)) return;
      const { kind } = path.node;
      if (kind === 'using' || kind === 'await using') {
        injectModulesForModeEntry('symbol/async-dispose');
        injectModulesForModeEntry('symbol/dispose');
        injectModulesForModeEntry('suppressed-error');
      }
    },
    ClassDeclaration: classVisitor,
    ClassExpression: classVisitor,
  };

  function functionVisitor(path) {
    if (isDisabled(path.node)) return;
    if (path.node.async) {
      injectModulesForModeEntry('promise/constructor');
      if (path.node.generator) {
        injectModulesForEntry('modules/es.symbol.async-iterator');
      }
    } else if (path.node.generator) {
      injectModulesForEntry('modules/es.symbol.iterator');
    }
  }

  function classVisitor(path) {
    if (isDisabled(path.node)) return;
    const { node } = path;
    if (node.decorators?.length || node.body.body.some(el => el.decorators?.length)) {
      injectModulesForModeEntry('symbol/metadata');
    }
  }
}
