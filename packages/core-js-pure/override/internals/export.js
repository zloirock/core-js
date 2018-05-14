'use strict';
var global = require('../internals/global');
var path = require('../internals/path');
var bind = require('../internals/bind-context');
var hide = require('../internals/hide');
var has = require('../internals/has');

var wrapConstructor = function (NativeConstructor) {
  var Wrapper = function (a, b, c) {
    if (this instanceof NativeConstructor) {
      switch (arguments.length) {
        case 0: return new NativeConstructor();
        case 1: return new NativeConstructor(a);
        case 2: return new NativeConstructor(a, b);
      } return new NativeConstructor(a, b, c);
    } return NativeConstructor.apply(this, arguments);
  };
  Wrapper.prototype = NativeConstructor.prototype;
  return Wrapper;
};

/*
  options.target - name of the target object
  options.global - target is the global object
  options.stat   - export as static methods of target
  options.proto  - export as prototype methods of target
  options.real   - real prototype method for the `pure` version
  options.forced - export even if the native feature is available
  options.bind   - bind methods to the target, required for the `pure` version
  options.wrap   - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe - use the simple assignment of property instead of delete + defineProperty
  options.sham   - add a flag to not completely full polyfills
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var PROTO = options.proto;

  var nativeSource = GLOBAL ? global : STATIC ? global[TARGET] : (global[TARGET] || {}).prototype;

  var target = GLOBAL ? path : path[TARGET] || (path[TARGET] = {});
  var targetPrototype = target.prototype;

  var USE_NATIVE, VIRTUAL_PROTOTYPE, key, sourceProperty, targetProperty, resultProperty;

  for (key in source) {
    // contains in native
    USE_NATIVE = !options.forced && nativeSource && has(nativeSource, key);

    targetProperty = target[key];

    if (USE_NATIVE && targetProperty) continue;

    // export native or implementation
    sourceProperty = USE_NATIVE ? nativeSource[key] : source[key];
    // bind timers to global for call from export context
    if (options.bind && USE_NATIVE) resultProperty = bind(sourceProperty, global);
    // wrap global constructors for prevent changs in this version
    else if (options.wrap && USE_NATIVE) resultProperty = wrapConstructor(sourceProperty);
    // make static versions for prototype methods
    else if (PROTO && typeof sourceProperty == 'function') resultProperty = bind(Function.call, sourceProperty);
    // default case
    else resultProperty = sourceProperty;

    // add a flag to not completely full polyfills
    if (options.sham || (sourceProperty && sourceProperty.sham) || (targetProperty && targetProperty.sham)) {
      hide(resultProperty, 'sham', true);
    }

    target[key] = resultProperty;

    if (PROTO) {
      VIRTUAL_PROTOTYPE = TARGET + 'Prototype';
      if (!has(path, VIRTUAL_PROTOTYPE)) hide(path, VIRTUAL_PROTOTYPE, {});
      // export virtual prototype methods
      path[VIRTUAL_PROTOTYPE][key] = sourceProperty;
      // export real prototype methods
      if (options.real && targetPrototype && !targetPrototype[key]) hide(targetPrototype, key, sourceProperty);
    }
  }
};
