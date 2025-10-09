import dedent from 'dedent';

const t = template => declared => processed => `'use strict';\n${ template({ ...processed, ...declared }) }\n`;

const importInternal = (module, level) => `require('${ level ? '../'.repeat(level) : './' }internals/${ module }');`;

const importModule = (module, level) => `require('${ level ? '../'.repeat(level) : './' }modules/${ module }');`;

const importModules = (modules, level) => modules.map(it => importModule(it, level)).join('\n');

function isAllowedFunctionName(name) {
  try {
    // eslint-disable-next-line no-new-func -- safe
    Function(`function ${ name }() { /* empty */ }`);
    return true;
  } catch {
    return false;
  }
}

export const $justImport = t(p => importModules(p.modules, p.level))();

export const $virtual = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var getBuiltInPrototypeMethod = ${ importInternal('get-built-in-prototype-method', p.level) }

  module.exports = getBuiltInPrototypeMethod('${ p.namespace }', '${ p.method }');
`);

export const $virtualIterator = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var getIteratorMethod = ${ importInternal('get-iterator-method', p.level) }

  module.exports = getIteratorMethod(${ p.source });
`);

export const $prototype = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var entryUnbind = ${ importInternal('entry-unbind', p.level) }

  module.exports = entryUnbind('${ p.namespace }', '${ p.method }');
`);

export const $prototypeIterator = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var uncurryThis = ${ importInternal('function-uncurry-this', p.level) }
  var getIteratorMethod = ${ importInternal('get-iterator-method', p.level) }

  module.exports = uncurryThis(getIteratorMethod(${ p.source }));
`);

export const $static = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }

  module.exports = getBuiltInStaticMethod('${ p.namespace }', '${ p.method }');
`);

export const $staticWithContext = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var getBuiltIn = ${ importInternal('get-built-in', p.level) }
  var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }
  var isCallable = ${ importInternal('is-callable', p.level) }
  var apply = ${ importInternal('function-apply', p.level) }

  var method = getBuiltInStaticMethod('${ p.namespace }', '${ p.method }');

  module.exports = function ${ isAllowedFunctionName(p.method) ? p.method : '' }() {
    return apply(method, isCallable(this) ? this : getBuiltIn('${ p.namespace }'), arguments);
  };
`);

export const $patchableStatic = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }
  var apply = ${ importInternal('function-apply', p.level) }

  module.exports = function ${ isAllowedFunctionName(p.method) ? p.method : '' }() {
    return apply(getBuiltInStaticMethod('${ p.namespace }', '${ p.method }'), this, arguments);
  };
`);

export const $namespace = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var path = ${ importInternal('path', p.level) }

  module.exports = path.${ p.name };
`);

export const $helper = t(p => dedent`
  ${ importModules(p.modules, p.level) }

  var $export = ${ importInternal(p.name, p.level) }

  module.exports = $export;
`);

export const $path = $helper({ name: 'path' });

export const $instanceArray = t(p => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var arrayMethod = require('../array/virtual/${ p.entry }');

  var ArrayPrototype = Array.prototype;

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && ownProperty === ArrayPrototype.${ p.name })) return arrayMethod;
    return ownProperty;
  };
`);

export const $instanceString = t(p => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var stringMethod = require('../string/virtual/${ p.entry }');

  var StringPrototype = String.prototype;

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (typeof it == 'string' || it === StringPrototype
      || (isPrototypeOf(StringPrototype, it) && ownProperty === StringPrototype.${ p.name })) return stringMethod;
    return ownProperty;
  };
`);

export const $instanceFunction = t(p => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var functionMethod = require('../function/virtual/${ p.entry }');

  var FunctionPrototype = Function.prototype;

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (it === FunctionPrototype || (isPrototypeOf(FunctionPrototype, it) && ownProperty === FunctionPrototype.${ p.name })) {
      return functionMethod;
    } return ownProperty;
  };
`);

export const $instanceDOMIterables = t(p => dedent`
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
`);

export const $instanceArrayString = t(p => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var arrayMethod = require('../array/virtual/${ p.entry }');
  var stringMethod = require('../string/virtual/${ p.entry }');

  var ArrayPrototype = Array.prototype;
  var StringPrototype = String.prototype;

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && ownProperty === ArrayPrototype.${ p.name })) return arrayMethod;
    if (typeof it == 'string' || it === StringPrototype
      || (isPrototypeOf(StringPrototype, it) && ownProperty === StringPrototype.${ p.name })) return stringMethod;
    return ownProperty;
  };
`);

export const $instanceArrayDOMIterables = t(p => dedent`
  var classof = require('../../internals/classof');
  var hasOwn = require('../../internals/has-own-property');
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var arrayMethod = require('../array/virtual/${ p.entry }');

  var ArrayPrototype = Array.prototype;

  var DOMIterables = {
    DOMTokenList: true,
    NodeList: true,
  };

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (it === ArrayPrototype || ((isPrototypeOf(ArrayPrototype, it)
      || hasOwn(DOMIterables, classof(it)) && ownProperty === ArrayPrototype.${ p.name }))) return arrayMethod;
    return ownProperty;
  };
`);

export const $instanceRegExpFlags = t(() => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var flags = require('../regexp/flags');

  var RegExpPrototype = RegExp.prototype;

  module.exports = function (it) {
    return (it === RegExpPrototype || isPrototypeOf(RegExpPrototype, it)) ? flags(it) : it.flags;
  };
`);
