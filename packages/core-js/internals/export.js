'use strict';
var globalThis = require('../internals/global-this');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIn = require('../internals/define-built-in');
var defineGlobalProperty = require('../internals/define-global-property');

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
  var target = options.global ? globalThis
    : options.stat ? globalThis[TARGET] || defineGlobalProperty(TARGET, {})
    : globalThis[TARGET] && globalThis[TARGET].prototype;
  var targetProperty, sourceProperty, descriptor;
  if (target) Object.keys(source).forEach(function (key) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = Object.getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    // contained in target
    if (!options.forced && typeof sourceProperty == typeof targetProperty) return;
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    defineBuiltIn(target, key, sourceProperty, options);
  });
};
