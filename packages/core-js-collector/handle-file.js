'use strict';
const { readFile } = require('fs').promises;
const { types: t } = require('@babel/core');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const entries = require('@core-js/compat/entries');
const modules = require('@core-js/compat/modules');
const {
  BuiltIns,
  StaticProperties,
  InstanceProperties,
  CommonIterators,
  PromiseDependencies,
  // CommonInstanceDependencies,
  PossibleGlobalObjects,
} = require('@core-js/compat/built-in-definitions');

const has = Function.call.bind(Object.hasOwnProperty);

function getType(target) {
  return Object.prototype.toString.call(target).slice(8, -1);
}

function resolveId(path) {
  if (path.isIdentifier() && !path.scope.hasBinding(path.node.name, true)) {
    return path.node.name;
  }

  const { deopt } = path.evaluate();
  if (deopt && deopt.isIdentifier()) {
    return deopt.node.name;
  }
}

function resolveKey(path, computed = false) {
  const { node, parent, scope } = path;
  if (path.isStringLiteral()) return node.value;
  const { name } = node;
  const isIdentifier = path.isIdentifier();
  if (isIdentifier && !(computed || parent.computed)) return name;
  if (
    computed &&
    path.isMemberExpression() &&
    path.get('object').isIdentifier({ name: 'Symbol' }) &&
    !scope.hasBinding('Symbol', true)
  ) {
    const sym = resolveKey(path.get('property'), path.node.computed);
    if (sym) return `Symbol.${ sym }`;
  }
  if (!isIdentifier || scope.hasBinding(name, true)) {
    const { value } = path.evaluate();
    if (typeof value === 'string') return value;
  }
}

function resolveSource(obj) {
  if (obj.isMemberExpression() && obj.get('property').isIdentifier({ name: 'prototype' })) {
    const id = resolveId(obj.get('object'));
    if (id) return { id, placement: 'prototype' };
    return { id: null, placement: null };
  }

  const id = resolveId(obj);
  if (id) return { id, placement: 'static' };

  const { value } = obj.evaluate();
  if (value !== undefined) {
    return { id: getType(value), placement: 'prototype' };
  } else if (obj.isRegExpLiteral()) {
    return { id: 'RegExp', placement: 'prototype' };
  } else if (obj.isFunction()) {
    return { id: 'Function', placement: 'prototype' };
  }

  return { id: null, placement: null };
}

module.exports = async function ({ filename }) {
  const file = await readFile(filename);

  const ast = parse(String(file), {
    sourceType: 'unambiguous',
    plugins: [
      'typescript',
    ],
  });

  let polyfills = new Set();
  const files = new Set();

  function addPolyfills(mod) {
    for (const name of mod) polyfills.add(name);
  }

  function handleImport(source) {
    if (has(entries, source)) {
      addPolyfills(entries[source]);
    } else {
      files.add(source);
    }
  }

  function handleBuiltIn(name) {
    if (BuiltIns.has(name)) {
      addPolyfills(BuiltIns.get(name).modules);
      return true;
    }
  }

  function handleProperty({ id, placement } = {}, key) {
    // console.log(id, placement, key);
    if (placement === 'static') {
      if (PossibleGlobalObjects.has(id)) {
        if (handleBuiltIn(key)) return;
      } else if (StaticProperties.has(id)) {
        const BuiltInProperties = StaticProperties.get(id);
        if (BuiltInProperties.has(key)) {
          return addPolyfills(BuiltInProperties.get(key).modules);
        }
      }
    }
    if (!InstanceProperties.has(key)) return;
    // TODO: placement optimisation case
    addPolyfills(InstanceProperties.get(key).modules);
  }

  traverse(ast, {
    // import
    ImportDeclaration({ node }) {
      // if (node.specifiers.length === 0) {
      handleImport(node.source.value);
      // }
    },
    CallExpression(path) {
      const callee = path.get('callee');
      // import('foo') instanceof Promise
      if (callee.isImport()) {
        addPolyfills([...PromiseDependencies, 'es.promise.all', ...CommonIterators]); // + Webpack case
        const [argument] = path.node.arguments;
        if (t.isStringLiteral(argument)) handleImport(argument.value);
      // require
      } else if (callee.isIdentifier() && callee.node.name === 'require') {
        const args = path.node.arguments;
        if (args.length === 1 && t.isStringLiteral(args[0])) handleImport(args[0].value);
      }
    },
    // Symbol(), new Promise
    ReferencedIdentifier({ node: { name }, scope }) {
      if (scope.getBindingIdentifier(name)) return;
      handleBuiltIn(name);
    },
    MemberExpression(path) {
      const source = resolveSource(path.get('object'));
      const key = resolveKey(path.get('property'), path.node.computed);
      // Object.entries
      // [1, 2, 3].entries
      handleProperty(source, key);
    },
    ObjectPattern(path) {
      const { parentPath, parent, key } = path;
      let source;
      // const { keys, values } = Object
      if (parentPath.isVariableDeclarator()) {
        source = resolveSource(parentPath.get('init'));
        // ({ keys, values } = Object)
      } else if (parentPath.isAssignmentExpression()) {
        source = resolveSource(parentPath.get('right'));
        // !function ({ keys, values }) {...} (Object)
        // resolution does not work after properties transform :-(
      } else if (parentPath.isFunctionExpression()) {
        const grand = parentPath.parentPath;
        if ((grand.isCallExpression() || grand.isNewExpression()) && grand.node.callee === parent) {
          source = resolveSource(grand.get('arguments')[key]);
        }
      }
      for (const property of path.get('properties')) {
        if (property.isObjectProperty()) {
          // const { keys, values } = Object
          // const { keys, values } = [1, 2, 3]
          handleProperty(source, resolveKey(property.get('key')));
        }
      }
    },
    BinaryExpression(path) {
      if (path.node.operator !== 'in') return;
      const source = resolveSource(path.get('right'));
      const key = resolveKey(path.get('left'), true);
      // 'entries' in Object
      // 'entries' in [1, 2, 3]
      handleProperty(source, key);
    },
    // (async function () { })() instanceof Promise
    Function(path) {
      if (path.node.async) {
        addPolyfills(PromiseDependencies);
      }
    },
    // for-of, [a, b] = c
    'ForOfStatement|ArrayPattern'() {
      addPolyfills(CommonIterators);
    },
    // [...spread]
    SpreadElement(path) {
      if (!path.parentPath.isObjectExpression()) {
        addPolyfills(CommonIterators);
      }
    },
    // yield *
    YieldExpression(path) {
      if (path.node.delegate) {
        addPolyfills(CommonIterators);
      }
    },
  });

  polyfills = modules.filter(it => polyfills.has(it));

  return { polyfills, files };
};
