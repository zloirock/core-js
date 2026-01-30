import { basename } from 'node:path';
import dedent from 'dedent';

const importInternal = (module, level) => `require('${ level ? '../'.repeat(level) : './' }internals/${ module }');`;

const importModule = (module, level) => `require('${ level ? '../'.repeat(level) : './' }modules/${ module }');`;

const importModules = ({ modules, level }) => modules.map(module => importModule(module, level)).join('\n');

const buildCoreJSTypeName = (namespace, name) => `CoreJS.${ namespace }${ name.charAt(0).toUpperCase() + name.slice(1) }`;

const buildModulePath = ({ entry, packageName }) => `${ packageName }${ entry }`;

function isAllowedFunctionName(name) {
  try {
    // eslint-disable-next-line no-new-func -- safe
    Function(`function ${ name }() { /* empty */ }`);
    return true;
  } catch {
    return false;
  }
}

const namespacesWithTwoGeneric = [
  'Map',
  'ReadonlyMap',
  'WeakMap',
];

const namespacesWithOneGeneric = [
  'Array',
  'ReadonlyArray',
  'Set',
  'ReadonlySet',
  'WeakSet',
  'Promise',
  'Iterator',
  'AsyncIterator',
];

const missingNamespacesInES6 = [
  'AsyncIterator',
];

function getGenericsForNamespace(namespace) {
  if (namespace === 'WeakMap') {
    return '<K extends WeakKey, V>';
  }
  if (namespacesWithTwoGeneric.includes(namespace)) {
    return '<K, V>';
  }
  if (namespacesWithOneGeneric.includes(namespace)) {
    return '<T>';
  }
  return '';
}

function getAnyGenericsForNamespace(namespace) {
  if (namespacesWithTwoGeneric.includes(namespace)) {
    return '<any, any>';
  }
  if (namespacesWithOneGeneric.includes(namespace)) {
    return '<any>';
  }
  return '';
}

function getCommonGenericsForNamespace(namespace) {
  if (namespacesWithTwoGeneric.includes(namespace)) {
    return '<K, V>';
  }
  if (namespacesWithOneGeneric.includes(namespace)) {
    return '<T>';
  }
  return '';
}

function getCustomGenerics(count) {
  const names = ['T', 'R', 'U'];
  return `<${ names.slice(0, count).join(', ') }>`;
}

export const wrapEntryInStrict = template => `'use strict';\n${ template }\n`;

export const $justImport = p => ({
  entry: dedent`
    ${ importModules(p) }
  `,
  types: '',
});

export const $prototype = p => ({
  entry: dedent`
    ${ importModules(p) }
    
    var getBuiltInPrototypeMethod = ${ importInternal('get-built-in-prototype-method', p.level) }
  
    module.exports = getBuiltInPrototypeMethod('${ p.namespace }', '${ p.name }');
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      type methodType${ getGenericsForNamespace(p.namespace) } = ${ p.prefix ?? '' }${ p.namespace }${ getCommonGenericsForNamespace(p.namespace) }['${ p.name }'];
      const method: methodType${ getAnyGenericsForNamespace(p.namespace) };
      export = method;
    }
  `,
});

export const $prototypeIterator = p => ({
  entry: dedent`
    ${ importModules(p) }
    
    var getIteratorMethod = ${ importInternal('get-iterator-method', p.level) }
  
    module.exports = getIteratorMethod(${ p.namespace }());
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: typeof ${ p.prefix ?? '' }${ p.namespace }.prototype[typeof Symbol.iterator];
      export = method;
    }
  `,
});

export const $uncurried = p => ({
  entry: dedent`
    ${ importModules(p) }
  
    var entryUnbind = ${ importInternal('entry-unbind', p.level) }
  
    module.exports = entryUnbind('${ p.namespace }', '${ p.name }');
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      type method${ getGenericsForNamespace(p.namespace) } = ${ p.prefix ?? '' }${ p.namespace }${ getCommonGenericsForNamespace(p.namespace) }['${ p.name }'];
      const resultMethod: ${ getGenericsForNamespace(p.namespace) }(self: ${ p.prefix && missingNamespacesInES6.includes(p.namespace) ? p.prefix : '' }${ p.namespace }${ getCommonGenericsForNamespace(p.namespace) }, ...args: Parameters<method${ getCommonGenericsForNamespace(p.namespace) }>) => ReturnType<method${ getCommonGenericsForNamespace(p.namespace) }>;
      export = resultMethod;
    }
  `,
});

export const $uncurriedWithCustomType = p => ({
  entry: dedent`
    ${ importModules(p) }
  
    var entryUnbind = ${ importInternal('entry-unbind', p.level) }
  
    module.exports = entryUnbind('${ p.namespace }', '${ p.name }');
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const resultMethod: ${ getCustomGenerics(p.genericsCount) }(self: ${ p.namespace }${ getCommonGenericsForNamespace(p.namespace) }, ...args: Parameters<${ buildCoreJSTypeName(p.namespace, p.name) }${ getCustomGenerics(p.genericsCount) }>) => ReturnType<${ buildCoreJSTypeName(p.namespace, p.name) }${ getCustomGenerics(p.genericsCount) }>;
      export = resultMethod;
    }
  `,
});

export const $uncurriedIterator = p => ({
  entry: dedent`
    ${ importModules(p) }
  
    var uncurryThis = ${ importInternal('function-uncurry-this', p.level) }
    var getIteratorMethod = ${ importInternal('get-iterator-method', p.level) }
  
    module.exports = uncurryThis(getIteratorMethod(${ p.namespace }()));
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      type method${ getGenericsForNamespace(p.namespace) } = ${ p.namespace }${ getGenericsForNamespace(p.namespace) }[typeof Symbol.iterator];
      const resultMethod: ${ getGenericsForNamespace(p.namespace) }(self: ${ p.namespace }${ getCommonGenericsForNamespace(p.namespace) }, ...args: Parameters<method${ getCommonGenericsForNamespace(p.namespace) }>) => ReturnType<method${ getCommonGenericsForNamespace(p.namespace) }>;
      export = resultMethod;
    }
  `,
});

export const $static = p => ({
  entry: dedent`
    ${ importModules(p) }
    
    var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }
  
    module.exports = getBuiltInStaticMethod('${ p.namespace }', '${ p.name }');
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: typeof ${ p.prefix ?? '' }${ p.namespace }.${ p.name };
      export = method;
    }
  `,
});

export const $staticWithContext = p => ({
  entry: dedent`
    ${ importModules(p) }
    
    var getBuiltIn = ${ importInternal('get-built-in', p.level) }
    var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }
    var isCallable = ${ importInternal('is-callable', p.level) }
    var apply = ${ importInternal('function-apply', p.level) }
  
    var method = getBuiltInStaticMethod('${ p.namespace }', '${ p.name }');
  
    module.exports = function ${ isAllowedFunctionName(p.name) ? p.name : '' }() {
      return apply(method, isCallable(this) ? this : getBuiltIn('${ p.namespace }'), arguments);
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: typeof ${ p.prefix ?? '' }${ p.namespace }.${ p.name };
      export = method;
    }
  `,
});

export const $patchableStatic = p => ({
  entry: dedent`
    ${ importModules(p) }
  
    var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }
    var apply = ${ importInternal('function-apply', p.level) }
  
    module.exports = function ${ isAllowedFunctionName(p.name) ? p.name : '' }() {
      return apply(getBuiltInStaticMethod('${ p.namespace }', '${ p.name }'), this, arguments);
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: typeof ${ p.prefix ?? '' }${ p.namespace }.${ p.name };
      export = method;
    }
  `,
});

export const $namespace = p => ({
  entry: dedent`
    ${ importModules(p) }
  
    var path = ${ importInternal('path', p.level) }
  
    module.exports = path.${ p.name };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const namespace: typeof ${ p.prefix ?? '' }${ p.name };
      export = namespace;
    }
  `,
});

export const $helper = p => ({
  entry: dedent`
    ${ importModules(p) }
  
    var $export = ${ importInternal(p.helper, p.level) }
  
    module.exports = $export;
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const helper: (arg: NonNullable<any>) => any;
      export = helper;
    }
  `,
});

export const $path = p => ({
  entry: dedent`
    ${ importModules(p) }
  
    var path = ${ importInternal('path', p.level) }
  
    module.exports = path;
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const path: typeof globalThis;
      export = path;
    }
  `,
});

export const $instanceArray = p => ({
  entry: dedent`
    var isPrototypeOf = require('../../internals/object-is-prototype-of');
    var arrayMethod = require('../array/prototype/${ basename(p.entry) }');
  
    var ArrayPrototype = Array.prototype;
  
    module.exports = function (it) {
      var ownProperty = it.${ p.name };
      if (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && ownProperty === ArrayPrototype.${ p.name })) return arrayMethod;
      return ownProperty;
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: (arg: NonNullable<any>) => any;
      export = method;
    }
  `,
});

export const $instanceNumber = p => ({
  entry: dedent`
    var isPrototypeOf = require('../../internals/object-is-prototype-of');
    var numberMethod = require('../number/prototype/${ basename(p.entry) }');
  
    var NumberPrototype = Number.prototype;
  
    module.exports = function (it) {
      var ownProperty = it.${ p.name };
      if (typeof it == 'number' || it === NumberPrototype
        || (isPrototypeOf(NumberPrototype, it) && ownProperty === NumberPrototype.${ p.name })) return numberMethod;
      return ownProperty;
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: (arg: NonNullable<any>) => any;
      export = method;
    }
  `,
});

export const $instanceString = p => ({
  entry: dedent`
    var isPrototypeOf = require('../../internals/object-is-prototype-of');
    var stringMethod = require('../string/prototype/${ basename(p.entry) }');
  
    var StringPrototype = String.prototype;
  
    module.exports = function (it) {
      var ownProperty = it.${ p.name };
      if (typeof it == 'string' || it === StringPrototype
        || (isPrototypeOf(StringPrototype, it) && ownProperty === StringPrototype.${ p.name })) return stringMethod;
      return ownProperty;
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: (arg: NonNullable<any>) => any;
      export = method;
    }
  `,
});

export const $instanceFunction = p => ({
  entry: dedent`
    var isPrototypeOf = require('../../internals/object-is-prototype-of');
    var functionMethod = require('../function/prototype/${ basename(p.entry) }');
  
    var FunctionPrototype = Function.prototype;
  
    module.exports = function (it) {
      var ownProperty = it.${ p.name };
      if (it === FunctionPrototype || (isPrototypeOf(FunctionPrototype, it) && ownProperty === FunctionPrototype.${ p.name })) {
        return functionMethod;
      } return ownProperty;
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: (arg: NonNullable<any>) => any;
      export = method;
    }
  `,
});

export const $instanceDOMIterables = p => ({
  entry: dedent`
    ${ importModules(p) }
    
    var classof = require('../../internals/classof');
    var hasOwn = require('../../internals/has-own-property');
  
    var arrayMethod = Array.prototype.${ p.name };
  
    var DOMIterables = {
      DOMTokenList: true,
      NodeList: true,
    };
  
    module.exports = function (it) {
      var ownProperty = it.${ p.name };
      if (hasOwn(DOMIterables, classof(it))) return arrayMethod;
      return ownProperty;
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: (arg: NonNullable<any>) => any;
      export = method;
    }
  `,
});

export const $instanceArrayString = p => ({
  entry: dedent`
    var isPrototypeOf = require('../../internals/object-is-prototype-of');
    var arrayMethod = require('../array/prototype/${ basename(p.entry) }');
    var stringMethod = require('../string/prototype/${ basename(p.entry) }');
  
    var ArrayPrototype = Array.prototype;
    var StringPrototype = String.prototype;
  
    module.exports = function (it) {
      var ownProperty = it.${ p.name };
      if (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && ownProperty === ArrayPrototype.${ p.name })) return arrayMethod;
      if (typeof it == 'string' || it === StringPrototype
        || (isPrototypeOf(StringPrototype, it) && ownProperty === StringPrototype.${ p.name })) return stringMethod;
      return ownProperty;
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: (arg: NonNullable<any>) => any;
      export = method;
    }
  `,
});

export const $instanceArrayDOMIterables = p => ({
  entry: dedent`
    ${ importModules(p) }
  
    var classof = require('../../internals/classof');
    var hasOwn = require('../../internals/has-own-property');
    var isPrototypeOf = require('../../internals/object-is-prototype-of');
    var arrayMethod = require('../array/prototype/${ basename(p.entry) }');
  
    var ArrayPrototype = Array.prototype;
  
    var DOMIterables = {
      DOMTokenList: true,
      NodeList: true,
    };
  
    module.exports = function (it) {
      var ownProperty = it.${ p.name };
      if (it === ArrayPrototype || ((isPrototypeOf(ArrayPrototype, it)
        || hasOwn(DOMIterables, classof(it))) && ownProperty === ArrayPrototype.${ p.name })) return arrayMethod;
      return ownProperty;
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: (arg: NonNullable<any>) => any;
      export = method;
    }
  `,
});

export const $instanceRegExpFlags = p => ({
  entry: dedent`
    ${ importModules(p) }
  
    var isPrototypeOf = require('../../internals/object-is-prototype-of');
    var flags = require('../regexp/flags');
  
    var RegExpPrototype = RegExp.prototype;
  
    module.exports = function (it) {
      return (it === RegExpPrototype || isPrototypeOf(RegExpPrototype, it)) ? flags(it) : it.flags;
    };
  `,
  types: dedent`
    declare module '${ buildModulePath(p) }' {
      const method: (arg: NonNullable<any>) => any;
      export = method;
    }
  `,
});

export const $proposal = p => ({
  entry: dedent`
    // proposal stage: ${ p.stage }
    // ${ p.link }
    ${ importModules(p) }
  `,
  types: '',
});
