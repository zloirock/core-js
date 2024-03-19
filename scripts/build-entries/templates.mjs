import { basename } from 'node:path';
import dedent from 'dedent';

const t = template => declared => processed => `'use strict';\n${ template({ ...processed, ...declared }) }\n`;

const importInternal = (module, level) => `require('${ level ? '../'.repeat(level) : './' }internals/${ module }');`;

const importModule = (module, level) => `require('${ level ? '../'.repeat(level) : './' }modules/${ module }');`;

const importModules = ({ modules, level }) => modules.map(module => importModule(module, level)).join('\n');

function isAllowedFunctionName(name) {
  try {
    // eslint-disable-next-line no-new-func -- safe
    Function(`function ${ name }() { /* empty */ }`);
    return true;
  } catch {
    return false;
  }
}

export const $justImport = t(p => importModules(p))();

export const $virtual = t(p => dedent`
  ${ importModules(p) }

  var getBuiltInPrototypeMethod = ${ importInternal('get-built-in-prototype-method', p.level) }

  module.exports = getBuiltInPrototypeMethod('${ p.namespace }', '${ p.method }');
`);

export const $virtualIterator = t(p => dedent`
  ${ importModules(p) }

  var getIteratorMethod = ${ importInternal('get-iterator-method', p.level) }

  module.exports = getIteratorMethod(${ p.source });
`)();

export const $prototype = t(p => dedent`
  ${ importModules(p) }

  var entryUnbind = ${ importInternal('entry-unbind', p.level) }

  module.exports = entryUnbind('${ p.namespace }', '${ p.method }');
`);

export const $prototypeIterator = t(p => dedent`
  ${ importModules(p) }

  var uncurryThis = ${ importInternal('function-uncurry-this', p.level) }
  var getIteratorMethod = ${ importInternal('get-iterator-method', p.level) }

  module.exports = uncurryThis(getIteratorMethod(${ p.source }));
`)();

export const $static = t(p => dedent`
  ${ importModules(p) }

  var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }

  module.exports = getBuiltInStaticMethod('${ p.namespace }', '${ p.name }');
`)();

export const $staticWithContext = t(p => dedent`
  ${ importModules(p) }

  var getBuiltIn = ${ importInternal('get-built-in', p.level) }
  var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }
  var isCallable = ${ importInternal('is-callable', p.level) }
  var apply = ${ importInternal('function-apply', p.level) }

  var method = getBuiltInStaticMethod('${ p.namespace }', '${ p.name }');

  module.exports = function ${ isAllowedFunctionName(p.name) ? p.name : '' }() {
    return apply(method, isCallable(this) ? this : getBuiltIn('${ p.namespace }'), arguments);
  };
`)();

export const $patchableStatic = t(p => dedent`
  ${ importModules(p) }

  var getBuiltInStaticMethod = ${ importInternal('get-built-in-static-method', p.level) }
  var apply = ${ importInternal('function-apply', p.level) }

  module.exports = function ${ isAllowedFunctionName(p.name) ? p.name : '' }() {
    return apply(getBuiltInStaticMethod('${ p.namespace }', '${ p.name }'), this, arguments);
  };
`)();

export const $namespace = t(p => dedent`
  ${ importModules(p) }

  var path = ${ importInternal('path', p.level) }

  module.exports = path.${ p.name };
`)();

export const $helper = t(p => dedent`
  ${ importModules(p) }

  var $export = ${ importInternal(p.helper, p.level) }

  module.exports = $export;
`)();

export const $path = t(p => dedent`
  ${ importModules(p) }

  var path = ${ importInternal('path', p.level) }

  module.exports = path;
`)();

export const $instanceArray = t(p => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var arrayMethod = require('../array/virtual/${ basename(p.entry) }');

  var ArrayPrototype = Array.prototype;

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && ownProperty === ArrayPrototype.${ p.name })) return arrayMethod;
    return ownProperty;
  };
`)();

export const $instanceNumber = t(p => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var numberMethod = require('../number/virtual/${ basename(p.entry) }');

  var NumberPrototype = Number.prototype;

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (typeof it == 'number' || it === NumberPrototype
      || (isPrototypeOf(NumberPrototype, it) && ownProperty === NumberPrototype.${ p.name })) return numberMethod;
    return ownProperty;
  };
`)();

export const $instanceString = t(p => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var stringMethod = require('../string/virtual/${ basename(p.entry) }');

  var StringPrototype = String.prototype;

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (typeof it == 'string' || it === StringPrototype
      || (isPrototypeOf(StringPrototype, it) && ownProperty === StringPrototype.${ p.name })) return stringMethod;
    return ownProperty;
  };
`)();

export const $instanceFunction = t(p => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var functionMethod = require('../function/virtual/${ basename(p.entry) }');

  var FunctionPrototype = Function.prototype;

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (it === FunctionPrototype || (isPrototypeOf(FunctionPrototype, it) && ownProperty === FunctionPrototype.${ p.name })) {
      return functionMethod;
    } return ownProperty;
  };
`)();

export const $instanceDOMIterables = t(p => dedent`
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
`)();

export const $instanceArrayString = t(p => dedent`
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var arrayMethod = require('../array/virtual/${ basename(p.entry) }');
  var stringMethod = require('../string/virtual/${ basename(p.entry) }');

  var ArrayPrototype = Array.prototype;
  var StringPrototype = String.prototype;

  module.exports = function (it) {
    var ownProperty = it.${ p.name };
    if (it === ArrayPrototype || (isPrototypeOf(ArrayPrototype, it) && ownProperty === ArrayPrototype.${ p.name })) return arrayMethod;
    if (typeof it == 'string' || it === StringPrototype
      || (isPrototypeOf(StringPrototype, it) && ownProperty === StringPrototype.${ p.name })) return stringMethod;
    return ownProperty;
  };
`)();

export const $instanceArrayDOMIterables = t(p => dedent`
  ${ importModules(p) }

  var classof = require('../../internals/classof');
  var hasOwn = require('../../internals/has-own-property');
  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var arrayMethod = require('../array/virtual/${ basename(p.entry) }');

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
`)();

export const $instanceRegExpFlags = t(p => dedent`
  ${ importModules(p) }

  var isPrototypeOf = require('../../internals/object-is-prototype-of');
  var flags = require('../regexp/flags');

  var RegExpPrototype = RegExp.prototype;

  module.exports = function (it) {
    return (it === RegExpPrototype || isPrototypeOf(RegExpPrototype, it)) ? flags(it) : it.flags;
  };
`)();

export const $proposal = t(p => dedent`
  // proposal stage: ${ p.stage }
  // ${ p.link }
  ${ importModules(p) }
`)();
