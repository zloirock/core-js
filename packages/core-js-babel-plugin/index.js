'use strict';
const { default: defineProvider } = require('@babel/helper-define-polyfill-provider');
const entries = require('@core-js/compat/entries.json');
const compat = require('@core-js/compat/compat');
const { normalizeCoreJSVersion } = require('@core-js/compat/helpers');
const getEntriesListForTargetVersion = require('@core-js/compat/get-entries-list-for-target-version');
const getModulesListForTargetVersion = require('@core-js/compat/get-modules-list-for-target-version');
const { Globals, StaticProperties, InstanceProperties } = require('@core-js/compat/built-in-definitions');

const defaultCoreJSPackages = ['core-js'];

const { hasOwn } = Object;

function normalizeImportPath(path) {
  return typeof path != 'string' ? null : path
    .replaceAll('\\', '/')
    .replace(/(?:\/(?:index)?)?(?:\.js)?$/i, '')
    .toLowerCase();
}

const TYPE_HINTS = new Set([
  'array',
  'bigint',
  'boolean',
  'date',
  'function',
  'iterator',
  'number',
  'object',
  'promise',
  'regexp',
  'string',
  'symbol',
]);

function $Primitive(type) {
  this.type = type;
  this.constructor = null;
}

$Primitive.prototype.primitive = true;

function $Object(constructor) {
  this.type = 'object';
  this.constructor = constructor;
}

$Object.prototype.primitive = false;

function resolveTypeAnnotation(node) {
  if (!node) return null;
  // Flow / TS wrappers
  if (node.type === 'TypeAnnotation' || node.type === 'TSTypeAnnotation') {
    return resolveTypeAnnotation(node.typeAnnotation);
  }
  switch (node.type) {
    // TS primitive keywords
    case 'TSStringKeyword':
    case 'StringTypeAnnotation':
      return new $Primitive('string');
    case 'TSNumberKeyword':
    case 'NumberTypeAnnotation':
      return new $Primitive('number');
    case 'TSBooleanKeyword':
    case 'BooleanTypeAnnotation':
      return new $Primitive('boolean');
    case 'TSBigIntKeyword':
    case 'BigIntTypeAnnotation':
      return new $Primitive('bigint');
    case 'TSSymbolKeyword':
    case 'SymbolTypeAnnotation':
      return new $Primitive('symbol');
    case 'TSVoidKeyword':
    case 'TSUndefinedKeyword':
    case 'VoidTypeAnnotation':
      return new $Primitive('undefined');
    case 'TSNullKeyword':
    case 'NullLiteralTypeAnnotation':
      return new $Primitive('null');
    // TS / Flow object types
    case 'TSObjectKeyword':
    case 'TSTypeLiteral':
    case 'ObjectTypeAnnotation':
      return new $Object('Object');
    case 'TSArrayType':
    case 'TSTupleType':
    case 'ArrayTypeAnnotation':
    case 'TupleTypeAnnotation':
      return new $Object('Array');
    case 'TSFunctionType':
    case 'TSConstructorType':
    case 'FunctionTypeAnnotation':
      return new $Object('Function');
    // TS / Flow named types — only well-known built-ins
    case 'TSTypeReference':
    case 'GenericTypeAnnotation': {
      const typeName = node.type === 'TSTypeReference' ? node.typeName : node.id;
      if (typeName?.type === 'Identifier') switch (typeName.name) {
        case 'Array':
        case 'Date':
        case 'Error':
        case 'Function':
        case 'Map':
        case 'Object':
        case 'Promise':
        case 'RegExp':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
        case 'String':
        case 'Number':
        case 'Boolean':
        case 'BigInt':
        case 'Symbol':
          return new $Object(typeName.name);
      }
      return null;
    }
    // TS literal types: 'hello', 42, true, etc.
    case 'TSLiteralType':
      if (node.literal) switch (node.literal.type) {
        case 'StringLiteral':
        case 'TemplateLiteral':
          return new $Primitive('string');
        case 'NumericLiteral':
        case 'UnaryExpression':
          return new $Primitive('number');
        case 'BooleanLiteral':
          return new $Primitive('boolean');
        case 'BigIntLiteral':
          return new $Primitive('bigint');
      }
      return null;
  }
  return null;
}

module.exports = defineProvider(({
  babel,
  createMetaResolver,
  debug,
  getUtils,
  method,
  targets,
}, {
  pkg,
  pkgs,
  mode = 'actual',
  version = '4.0',
}) => {
  if (!['entry-global', 'usage-global', 'usage-pure'].includes(method)) throw new TypeError('Incorrect plugin method');
  if (!['es', 'stable', 'actual', 'full'].includes(mode)) throw new TypeError('Incorrect plugin mode');

  if (pkg === undefined) pkg = method === 'usage-pure' ? '@core-js/pure' : 'core-js';
  if (typeof pkg != 'string') throw new TypeError('Incorrect package name');

  version = normalizeCoreJSVersion(version);

  const t = babel.types;
  const isWebpack = babel.caller(caller => caller?.name === 'babel-loader');

  const packages = pkgs ? [...defaultCoreJSPackages, ...pkgs] : defaultCoreJSPackages;

  const entriesSetForTargetVersion = method === 'usage-pure' && new Set(getEntriesListForTargetVersion(version));
  const modulesListForTargetVersion = getModulesListForTargetVersion(version);
  const injectedModules = new Set();
  const skippedNodes = new WeakSet();

  if (!Object.keys(targets).length) targets = null;

  const resolve = createMetaResolver({
    global: Globals,
    static: StaticProperties,
    instance: InstanceProperties,
  });

  function getCoreJSEntry(source) {
    source = normalizeImportPath(source);
    if (source === null) return null;
    for (const $pkg of packages) {
      if (source === $pkg) return '';
      if (source.startsWith(`${ $pkg }/`)) {
        const entry = source.slice($pkg.length + 1);
        if (hasOwn(entries, entry)) return entry;
      }
    }
    return null;
  }

  const modulesForEntryCache = new Map();

  function getModulesForEntry(entry) {
    if (entry === '') entry = 'index';
    if (modulesForEntryCache.has(entry)) return modulesForEntryCache.get(entry);
    const result = hasOwn(entries, entry) ? compat({ modules: entries[entry], targets, version }).list : [];
    modulesForEntryCache.set(entry, result);
    return result;
  }

  function injectModulesForModeEntry(entry, utils) {
    return injectModulesForEntry(`${ mode }/${ entry }`, utils);
  }

  function injectModulesForEntry(entry, utils) {
    for (const moduleName of getModulesForEntry(entry)) {
      injectModule(moduleName, utils);
    }
  }

  function injectModule(moduleName, utils) {
    const moduleEntry = `modules/${ moduleName }`;
    utils.injectGlobalImport(`${ pkg }/${ moduleEntry }`, moduleName);
    injectedModules.add(moduleEntry);
    debug(moduleName);
  }

  function isCallee(callee, parent) {
    return t.isCallExpression(parent, { callee })
      || t.isOptionalCallExpression(parent, { callee })
      || t.isNewExpression(parent, { callee });
  }

  function resolvePath(path) {
    let depth = 5;
    while (depth-- && path.isIdentifier()) {
      const binding = path.scope.getBinding(path.node.name);
      if (!binding || !binding.constant) break;
      const { path: bindingPath } = binding;
      if (bindingPath.isVariableDeclarator()) {
        const init = bindingPath.get('init');
        if (init.node) {
          path = init;
          continue;
        }
      }
      if (bindingPath.isFunctionDeclaration() || bindingPath.isClassDeclaration()) return bindingPath;
      break;
    }
    return path;
  }

  function resolveNumericType(path) {
    const resolved = resolveNodeType(path);
    return new $Primitive(resolved === null ? null : resolved.type === 'bigint' ? 'bigint' : 'number');
  }

  function resolveUnionType(leftPath, rightPath) {
    const left = resolveNodeType(leftPath);
    const right = resolveNodeType(rightPath);
    if (left && right && left.type === right.type && left.constructor === right.constructor) return left;
    return null;
  }

  function resolveBinaryOperatorType(operator, leftPath, rightPath) {
    switch (operator) {
      case '+': {
        const left = resolveNodeType(leftPath);
        const right = resolveNodeType(rightPath);
        if (left?.type === 'string' || right?.type === 'string') return new $Primitive('string');
        if (left?.type === 'number' && right?.type === 'number') return new $Primitive('number');
        if (left?.type === 'bigint' && right?.type === 'bigint') return new $Primitive('bigint');
        return new $Primitive(null);
      }
      // >>> (unsigned right shift) throws on BigInt, result is always Number
      case '>>>':
        return new $Primitive('number');
      // arithmetic and bitwise operators work on both Number and BigInt
      // mixing them throws, so knowing one operand's type determines the result
      case '-':
      case '*':
      case '/':
      case '%':
      case '**':
      case '|':
      case '&':
      case '^':
      case '<<':
      case '>>': {
        const left = resolveNodeType(leftPath);
        const right = resolveNodeType(rightPath);
        if (left?.type === 'bigint' || right?.type === 'bigint') return new $Primitive('bigint');
        if (left !== null || right !== null) return new $Primitive('number');
        return new $Primitive(null);
      }
    }
    return null;
  }

  function resolveNodeType(path) {
    path = resolvePath(path);

    switch (path.node.type) {
      case 'Identifier': {
        const { name } = path.node;
        if (!path.scope.getBinding(name)) switch (name) {
          case 'undefined':
            return new $Primitive('undefined');
          case 'Infinity':
          case 'NaN':
            return new $Primitive('number');
          case 'arguments':
            return new $Object('Arguments');
        }
        return null;
      }
      case 'NullLiteral':
        return new $Primitive('null');
      case 'StringLiteral':
      case 'TemplateLiteral':
        return new $Primitive('string');
      case 'NumericLiteral':
        return new $Primitive('number');
      case 'BigIntLiteral':
        return new $Primitive('bigint');
      case 'BooleanLiteral':
        return new $Primitive('boolean');
      case 'RegExpLiteral':
        return new $Object('RegExp');
      case 'ObjectExpression':
        return new $Object('Object');
      case 'ArrayExpression':
        return new $Object('Array');
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'FunctionDeclaration':
      case 'ClassExpression':
      case 'ClassDeclaration':
        return new $Object('Function');
      case 'NewExpression': {
        const callee = path.get('callee');
        const { name } = callee.node;
        if (callee.isIdentifier() && !callee.scope.getBinding(name)) return new $Object(name);
        return new $Object(null);
      }
      case 'CallExpression':
      case 'OptionalCallExpression': {
        const callee = path.get('callee');
        const { name } = callee.node;
        if (callee.isIdentifier() && !callee.scope.getBinding(name)) {
          // just some popular cases
          switch (name) {
            case 'String':
            case 'Number':
            case 'Boolean':
            case 'BigInt':
            case 'Symbol':
              return new $Primitive(name.toLowerCase());
            case 'Array':
            case 'Object':
            case 'RegExp':
            case 'Function':
              return new $Object(name);
          }
        }
        return null;
      }
      case 'UnaryExpression':
        switch (path.node.operator) {
          case 'void':
            return new $Primitive('undefined');
          case 'typeof':
            return new $Primitive('string');
          case '!':
          case 'delete':
            return new $Primitive('boolean');
          // unary + throws on BigInt, result is always Number
          case '+':
            return new $Primitive('number');
          // unary - and ~ work on both Number and BigInt, preserving the type
          case '-':
          case '~':
            return resolveNumericType(path.get('argument'));
        }
        return null;
      case 'UpdateExpression':
        // ++ and -- work on both Number and BigInt, preserving the type
        return resolveNumericType(path.get('argument'));
      case 'BinaryExpression':
        switch (path.node.operator) {
          case '==':
          case '!=':
          case '===':
          case '!==':
          case '<':
          case '>':
          case '<=':
          case '>=':
          case 'instanceof':
          case 'in':
            return new $Primitive('boolean');
          default:
            return resolveBinaryOperatorType(path.node.operator, path.get('left'), path.get('right'));
        }
      case 'SequenceExpression': {
        const expressions = path.get('expressions');
        if (expressions.length) return resolveNodeType(expressions[expressions.length - 1]);
        return null;
      }
      case 'AssignmentExpression':
        switch (path.node.operator) {
          case '=':
            return resolveNodeType(path.get('right'));
          case '||=':
          case '&&=':
          case '??=':
            return resolveUnionType(path.get('left'), path.get('right'));
          default:
            return resolveBinaryOperatorType(path.node.operator.slice(0, -1), path.get('left'), path.get('right'));
        }
      case 'ConditionalExpression':
        return resolveUnionType(path.get('consequent'), path.get('alternate'));
      case 'LogicalExpression':
        return resolveUnionType(path.get('left'), path.get('right'));
      case 'ParenthesizedExpression':
        return resolveNodeType(path.get('expression'));
      case 'TSAsExpression':
      case 'TSTypeAssertion':
      case 'TypeCastExpression':
        return resolveTypeAnnotation(path.node.typeAnnotation) || resolveNodeType(path.get('expression'));
      case 'TSSatisfiesExpression':
        return resolveNodeType(path.get('expression')) || resolveTypeAnnotation(path.node.typeAnnotation);
      case 'TSNonNullExpression':
      case 'TSInstantiationExpression':
        return resolveNodeType(path.get('expression'));
    }
    return null;
  }

  function resolveHint(desc, meta) {
    const { placement, object } = meta;
    const hint = String(object).toLowerCase();

    if (placement === 'prototype' && TYPE_HINTS.has(hint)) {
      let hasOtherHints = false;
      for (const $hint of TYPE_HINTS) if (hasOwn(desc, $hint)) {
        if (hint === $hint) return desc[hint];
        hasOtherHints = true;
      }
      return hasOtherHints ? null : hasOwn(desc, 'common') ? desc.common : null;
    }

    if (hasOwn(desc, 'common')) return desc.common;

    // no common — merge all type hint dependencies
    const hintDescs = [];
    for (const $hint of TYPE_HINTS) {
      if (hasOwn(desc, $hint)) hintDescs.push(desc[$hint]);
    }

    if (hintDescs.length === 1) return hintDescs[0];

    if (hintDescs.length > 1) {
      const dependencies = [...new Set(hintDescs.flatMap(d => d?.dependencies ?? []))];
      return dependencies.length ? { dependencies } : null;
    }

    return null;
  }

  function isString(path) {
    const it = resolveNodeType(path);
    return it?.type === 'string' || it?.constructor === 'String';
  }

  function isObject(path) {
    return resolveNodeType(path)?.primitive === false;
  }

  function filter(name, args, path) {
    const { node, parent } = path;
    switch (name) {
      case 'min-args': {
        if (!isCallee(node, parent)) return false;
        const [length] = args;
        if (parent.arguments.length >= length) return false;
        return parent.arguments.every(arg => !t.isSpreadElement(arg));
      }
      case 'arg-is-string':
      case 'arg-is-object': {
        if (!isCallee(node, parent)) return false;
        const [index] = args;
        if (parent.arguments.length < index + 1) return false;
        if (parent.arguments.slice(0, index).some(arg => t.isSpreadElement(arg))) return false;
        const arg = path.parentPath.get('arguments')[index];
        return name === 'arg-is-string' ? isString(arg) : isObject(arg);
      }
    }
    return false;
  }

  function applyFilters(filters, path) {
    return !!filters?.some(([name, ...args]) => filter(name, args, path));
  }

  function isEntryNeeded(entry) {
    const modeEntry = `${ mode }/${ entry }`;
    return entriesSetForTargetVersion.has(modeEntry) && !!getModulesForEntry(modeEntry).length;
  }

  function injectPureImport(entry, hint, utils) {
    return utils.injectDefaultImport(`${ pkg }/${ mode }/${ entry }`, hint);
  }

  function resolvePureEntry(kind, desc, meta, path) {
    let target = desc;
    if (kind === 'instance') {
      target = resolveHint(desc, meta);
      if (target === null) return null;
    }
    if (applyFilters(target.filters, path)) return null;
    if (!target.dependencies?.length) return null;
    const [entry] = target.dependencies;
    if (!isEntryNeeded(entry)) return null;
    // import from common wrapper to get correct (non-decurried) export
    return kind === 'instance' && hasOwn(desc, 'common') ? desc.common.dependencies[0] : entry;
  }

  function memoize(node, scope) {
    if (t.isIdentifier(node)) return [t.cloneNode(node), node];
    const ref = scope.generateDeclaredUidIdentifier('ref');
    return [t.assignmentExpression('=', t.cloneNode(ref), node), ref];
  }

  function wrapConditional(check, result) {
    return t.conditionalExpression(
      t.binaryExpression('==', check, t.nullLiteral()),
      t.unaryExpression('void', t.numericLiteral(0)),
      result,
    );
  }

  function buildMethodCall(id, object, scope, args, optionalCall) {
    const [assign, ref] = memoize(object, scope);
    const callMember = optionalCall
      ? t.optionalMemberExpression(t.callExpression(id, [assign]), t.identifier('call'), false, true)
      : t.memberExpression(t.callExpression(id, [assign]), t.identifier('call'));
    return optionalCall
      ? t.optionalCallExpression(callMember, [t.cloneNode(ref), ...args], false)
      : t.callExpression(callMember, [t.cloneNode(ref), ...args]);
  }

  function deoptionalizeNode(path) {
    const type = path.isOptionalMemberExpression() ? 'MemberExpression' : 'CallExpression';
    path.node.type = type;
    path.type = type;
    delete path.node.optional;
  }

  function normalizeOptionalChain(path, all) {
    let { parentPath } = path;
    if (parentPath.isOptionalMemberExpression()) {
      if (path.key !== 'object') return null;
    } else if (parentPath.isOptionalCallExpression()) {
      if (path.key !== 'callee') return null;
    } else return null;
    let topPath = null;
    // eslint-disable-next-line no-unmodified-loop-condition -- safe
    while ((parentPath.isOptionalMemberExpression() || parentPath.isOptionalCallExpression()) && (all || !parentPath.node.optional)) {
      topPath = parentPath;
      deoptionalizeNode(parentPath);
      ({ parentPath } = parentPath);
    }
    return topPath;
  }

  function extractCheck(path) {
    const { node } = path;
    if (node.optional) return memoize(node.object, path.scope);
    if (!path.isOptionalMemberExpression()) return [null, node.object];
    let chainStart = null;
    let current = path.get('object');
    while (current.isOptionalMemberExpression() || current.isOptionalCallExpression()) {
      if (current.node.optional) {
        chainStart = current;
        break;
      }
      current = current.isOptionalMemberExpression() ? current.get('object') : current.get('callee');
    }
    if (!chainStart) return [null, node.object];
    const key = chainStart.isOptionalMemberExpression() ? 'object' : 'callee';
    const [check, ref] = memoize(chainStart.node[key], path.scope);
    chainStart.node[key] = t.cloneNode(ref);
    deoptionalizeNode(chainStart);
    for (let p = chainStart.parentPath; p !== path; p = p.parentPath) {
      if (p.isOptionalMemberExpression() || p.isOptionalCallExpression()) deoptionalizeNode(p);
    }
    return [check, node.object];
  }

  function replaceAndWrap(replacePath, result, check) {
    replacePath.replaceWith(result);
    const wrapPath = normalizeOptionalChain(replacePath) || replacePath;
    if (check) wrapPath.replaceWith(wrapConditional(check, wrapPath.node));
  }

  function replaceInstanceLike(path, id) {
    const { node, parent } = path;
    const isCall = (t.isCallExpression(parent) || t.isOptionalCallExpression(parent)) && parent.callee === node;
    const [check, object] = extractCheck(path);
    const result = isCall
      ? buildMethodCall(id, object, path.scope, parent.arguments, parent.optional)
      : t.callExpression(id, [t.cloneNode(object)]);
    replaceAndWrap(isCall ? path.parentPath : path, result, check);
  }

  function replaceCallWithSimple(path, id) {
    const [check, object] = extractCheck(path);
    replaceAndWrap(path.parentPath, t.callExpression(id, [t.cloneNode(object)]), check);
  }

  function handleSymbolIterator(path, utils) {
    const { parent, node } = path;
    if (node.computed) skippedNodes.add(node.property);
    const isCall = t.isCallExpression(parent, { callee: node })
      || t.isOptionalCallExpression(parent, { callee: node });
    if (isCall && parent.arguments.length === 0) {
      if (!isEntryNeeded('get-iterator')) return;
      replaceCallWithSimple(path, injectPureImport('get-iterator', 'getIterator', utils));
    } else {
      if (!isEntryNeeded('get-iterator-method')) return;
      replaceInstanceLike(path, injectPureImport('get-iterator-method', 'getIteratorMethod', utils));
    }
  }

  function resolveDestructuringObject(path) {
    const parent = path.parentPath.parentPath;
    const initKey = parent.isVariableDeclarator() ? 'init'
      : parent.isAssignmentExpression() ? 'right' : null;
    if (!initKey) return null;
    const objectNode = parent.node[initKey];
    if (!objectNode) return null;
    // memoize non-identifier init when other properties remain to avoid double evaluation
    if (!t.isIdentifier(objectNode) && path.parentPath.node.properties.length > 1) {
      const ref = path.scope.generateUidIdentifier('ref');
      parent.parentPath.insertBefore(t.variableDeclaration('const', [
        t.variableDeclarator(ref, objectNode),
      ]));
      parent.node[initKey] = t.cloneNode(ref);
      return ref;
    }
    return objectNode;
  }

  function handleDestructuredProperty(prop, value) {
    const localBinding = t.cloneNode(prop.node.value);
    const objectPattern = prop.parentPath;
    const parent = objectPattern.parentPath;

    prop.remove();
    const isEmpty = objectPattern.node.properties.length === 0;

    if (parent.isVariableDeclarator()) {
      const declaration = parent.parentPath;
      // multi-declarator: modify in-place to avoid Babel traversal crash
      if (isEmpty && declaration.node.declarations.length > 1) {
        parent.node.id = localBinding;
        parent.node.init = value;
      } else {
        const newDecl = t.variableDeclaration(declaration.node.kind, [
          t.variableDeclarator(localBinding, value),
        ]);
        if (isEmpty) {
          declaration.replaceWith(newDecl);
        } else if (declaration.parentPath.isExportNamedDeclaration()) {
          declaration.parentPath.insertBefore(t.exportNamedDeclaration(newDecl));
        } else {
          declaration.insertBefore(newDecl);
        }
      }
    } else {
      const stmt = t.expressionStatement(t.assignmentExpression('=', localBinding, value));
      const target = parent.parentPath;
      if (isEmpty) {
        target.replaceWith(stmt);
      } else {
        target.insertBefore(stmt);
      }
    }
  }

  return {
    name: 'core-js@4',
    polyfills: modulesListForTargetVersion,
    entryGlobal({ source }, utils, path) {
      const entry = getCoreJSEntry(source);
      if (entry === null) return;
      if (!path.node.loc && injectedModules.has(entry)) return;
      injectModulesForEntry(entry, utils);
      path.remove();
    },
    usageGlobal(meta, utils, path) {
      const resolved = resolve(meta);
      if (!resolved || !hasOwn(resolved.desc, 'global')) return;
      let { kind, desc: { global: desc } } = resolved;
      if (kind === 'instance') {
        desc = resolveHint(desc, meta);
        if (desc === null) return true;
      }
      const { dependencies, filters } = desc;
      if (!dependencies?.length) return true;
      if (applyFilters(filters, path)) return true;
      for (const entry of dependencies) {
        injectModulesForModeEntry(entry, utils);
      }
      return true;
    },

    usagePure(meta, utils, path) {
      if (skippedNodes.has(path.node)) return;

      if (meta.kind === 'in') {
        if (meta.key === 'Symbol.iterator' && isEntryNeeded('is-iterable')) {
          path.replaceWith(t.callExpression(injectPureImport('is-iterable', 'isIterable', utils), [path.node.right]));
        }
        return;
      }

      // can't polyfill delete expressions
      if (path.parentPath.isUnaryExpression({ operator: 'delete' })) return;

      if (meta.kind === 'property') {
        if (path.isObjectProperty()) {
          // destructuring: const { from } = Array
          if (!t.isIdentifier(path.node.value)) return;
          // can't extract property when rest element is present — would change rest semantics
          if (path.parentPath.node.properties.some(p => t.isRestElement(p))) return;
        } else {
          if (!path.isMemberExpression() && !path.isOptionalMemberExpression()) return;
          if (!path.isReferenced()) return;
          if (path.parentPath.isUpdateExpression()) return;
          if (t.isSuper(path.node.object)) return;

          if (meta.key === 'Symbol.iterator') return handleSymbolIterator(path, utils);
        }
      }

      const resolved = resolve(meta);
      if (!resolved || !hasOwn(resolved.desc, 'pure')) return;

      const { kind, desc: { pure: desc } } = resolved;
      const importEntry = resolvePureEntry(kind, desc, meta, path);
      if (!importEntry) return;

      const hintName = kind === 'instance' ? `${ resolved.name }InstanceProperty` : resolved.name;

      if (path.isObjectProperty()) {
        // verify destructuring context is transformable before injecting import
        const objectPattern = path.parentPath;
        const destructParent = objectPattern.parentPath;
        if (!destructParent.isVariableDeclarator() && !destructParent.isAssignmentExpression()) return;
        if (destructParent.isAssignmentExpression() && !destructParent.parentPath.isExpressionStatement()) return;
        // for-in/for-of: value comes from iteration, not from init — can't polyfill
        if (destructParent.isVariableDeclarator() && !destructParent.node.init) return;
        // insertBefore in for-loop init wraps in IIFE, breaking variable scope
        if (destructParent.isVariableDeclarator() && objectPattern.node.properties.length > 1
          && destructParent.parentPath.parentPath.isForStatement()) return;

        let value;
        if (kind === 'instance') {
          const objectNode = resolveDestructuringObject(path);
          if (!objectNode) return;
          value = t.callExpression(injectPureImport(importEntry, hintName, utils), [t.cloneNode(objectNode)]);
        } else {
          value = injectPureImport(importEntry, hintName, utils);
        }
        handleDestructuredProperty(path, value);
      } else {
        const id = injectPureImport(importEntry, hintName, utils);
        if (kind === 'instance') {
          replaceInstanceLike(path, id);
        } else {
          path.replaceWith(id);
          normalizeOptionalChain(path, true);
        }
      }
    },

    visitor: method === 'usage-global' && {
      // import('foo')
      CallExpression(path) {
        if (path.get('callee').isImport()) {
          const utils = getUtils(path);
          if (isWebpack) {
            // Webpack uses `Promise.all` to handle dynamic import.
            injectModulesForModeEntry('promise/all', utils);
          } else {
            injectModulesForModeEntry('promise/constructor', utils);
          }
        }
      },
      // (async function () { }).finally(...)
      Function(path) {
        if (path.node.async) {
          injectModulesForModeEntry('promise/constructor', getUtils(path));
          // async function * () { }
          if (path.node.generator) {
            injectModulesForEntry('modules/es.symbol.async-iterator', getUtils(path));
          }
        // function * () { }
        } else if (path.node.generator) {
          injectModulesForEntry('modules/es.symbol.iterator', getUtils(path));
        }
      },
      // for-of, [a, b] = c
      'ForOfStatement|ArrayPattern'(path) {
        injectModulesForModeEntry('symbol/iterator', getUtils(path));
        // for-await-of
        if (path.isForOfStatement() && path.node.await) {
          injectModulesForModeEntry('symbol/async-iterator', getUtils(path));
        }
      },
      // [...spread]
      SpreadElement(path) {
        if (!path.parentPath.isObjectExpression()) {
          injectModulesForModeEntry('symbol/iterator', getUtils(path));
        }
      },
      // yield *
      YieldExpression(path) {
        if (path.node.delegate) {
          injectModulesForModeEntry('symbol/iterator', getUtils(path));
        }
      },
      // decorators metadata
      Class(path) {
        if (path.node.decorators?.length || path.node.body.body.some(el => el.decorators?.length)) {
          injectModulesForModeEntry('symbol/metadata', getUtils(path));
        }
      },
    },
  };
});
