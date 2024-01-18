'use strict';
var globalThis = require('../internals/global-this');
var apply = require('../internals/function-apply');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var isCallable = require('../internals/is-callable');
var path = require('../internals/path');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var hasOwn = require('../internals/has-own-property');
// add debugging info
require('../internals/shared-store');

var create = Object.create;

var wrapConstructor = function (NativeConstructor) {
  var Wrapper = function (a, b, c) {
    if (this instanceof Wrapper) {
      switch (arguments.length) {
        case 0: return new NativeConstructor();
        case 1: return new NativeConstructor(a);
        case 2: return new NativeConstructor(a, b);
      } return new NativeConstructor(a, b, c);
    } return apply(NativeConstructor, this, arguments);
  };
  Wrapper.prototype = NativeConstructor.prototype;
  return Wrapper;
};

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var PROTO = options.proto;
  var FORCED = options.forced;

  var nativeSource = GLOBAL ? globalThis : STATIC ? globalThis[TARGET] : globalThis[TARGET] && globalThis[TARGET].prototype;

  var target = GLOBAL ? path : path[TARGET] || (path[TARGET] = create(null));
  var targetPrototype = target.prototype;

  Object.keys(source).forEach(function (key) {
    // contains in native
    var USE_NATIVE = !FORCED && nativeSource && hasOwn(nativeSource, key);
    var nativeProperty, descriptor;

    if (USE_NATIVE) if (options.dontCallGetSet) {
      descriptor = Object.getOwnPropertyDescriptor(nativeSource, key);
      nativeProperty = descriptor && descriptor.value;
    } else nativeProperty = nativeSource[key];

    // export native or implementation
    var baseResultProperty = USE_NATIVE ? nativeProperty : source[key];

    if (!FORCED && !PROTO && typeof target[key] == typeof baseResultProperty) return;

    // make static versions of prototype methods
    var resultProperty = PROTO && isCallable(baseResultProperty) ? uncurryThis(baseResultProperty)
      // bind methods to global for calling from export context
      : options.bind && USE_NATIVE ? baseResultProperty.bind(globalThis)
      // wrap global constructors for prevent changes in this version
      : options.wrap && USE_NATIVE ? wrapConstructor(baseResultProperty)
      // default case
      : baseResultProperty;

    // add a flag to not completely full polyfills
    if (options.sham || (baseResultProperty && baseResultProperty.sham)) {
      createNonEnumerableProperty(resultProperty, 'sham', true);
    }

    createNonEnumerableProperty(target, key, resultProperty);

    if (PROTO) {
      var VIRTUAL_PROTOTYPE = TARGET + 'Prototype';
      if (!hasOwn(path, VIRTUAL_PROTOTYPE)) {
        createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, create(null));
      }
      // export virtual prototype methods
      createNonEnumerableProperty(path[VIRTUAL_PROTOTYPE], key, baseResultProperty);
      // export real prototype methods
      if (options.real && targetPrototype && (FORCED || !targetPrototype[key])) {
        createNonEnumerableProperty(targetPrototype, key, baseResultProperty);
      }
    }
  });
};
