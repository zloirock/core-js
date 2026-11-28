'use strict';
var globalThis = require('../internals/global-this');
var apply = require('../internals/function-apply');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var isCallable = require('../internals/is-callable');
var path = require('../internals/path');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIn = require('../internals/define-built-in');
var inheritIfRequired = require('../internals/inherit-if-required');
var hasOwn = require('../internals/has-own-property');
// add debugging info
require('../internals/shared-store');

var create = Object.create;
var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;

var wrapConstructor = function (NativeConstructor, arity) {
  var NativePrototype = NativeConstructor.prototype;
  var Wrapper = function (a, b, c) {
    var instance;
    if (this instanceof Wrapper) {
      switch (arguments.length) {
        case 0: instance = new NativeConstructor(); break;
        case 1: instance = new NativeConstructor(a); break;
        case 2: instance = new NativeConstructor(a, b); break;
        default: instance = new NativeConstructor(a, b, c);
      } return inheritIfRequired(instance, this, NativePrototype);
    } return apply(NativeConstructor, this, arguments);
  };
  Wrapper.prototype = NativePrototype;
  // function length is not configurable in some old engines
  try {
    defineBuiltIn(Wrapper, 'length', arity === undefined ? NativeConstructor.length : arity, { nonWritable: true });
  } catch (error) { /* empty */ }
  return Wrapper;
};

var copyOwnProperties = function (from, to, previous) {
  var names = getOwnPropertyNames(from);
  var extra = previous && getOwnPropertyNames(previous);
  var pending = extra && create(null);
  if (extra) extra.forEach(function (key) { pending[key] = true; });
  var copy = function (key) {
    var owner = pending && pending[key] ? previous : from;
    if (pending) delete pending[key];
    try {
      defineProperty(to, key, getOwnPropertyDescriptor(owner, key));
    } catch (error) { /* empty */ }
  };
  names.forEach(copy);
  if (extra) extra.forEach(function (key) { if (pending[key]) copy(key); });
  return to;
};

/*
  options.target          - name of the target object
  options.global          - target is the global object
  options.stat            - export as static methods of target
  options.proto           - export as prototype methods of target
  options.real            - real prototype method for the `pure` version
  options.forced          - export even if the native feature is available
  options.bind            - bind methods to the target, required for the `pure` version
  options.wrap            - wrap constructors to preventing global pollution, required for the `pure` version
  options.constructor     - the export is a constructor with a non-writable .prototype
  options.unsafe          - use the simple assignment of property instead of delete + defineProperty
  options.sham            - add a flag to not completely full polyfills
  options.enumerable      - export as enumerable property
  options.nonConfigurable - export as non-configurable property
  options.nonWritable     - export as non-writable property
  options.namespace       - the exported value is a namespace object
  options.name            - the .name of the function if it does not match the key
  options.arity           - the .length of the function if it does not match its parameters
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var PROTO = options.proto;
  var FORCED = options.forced;
  var canHaveStatics = GLOBAL && (options.namespace || options.constructor === true);
  var checkExisting = !FORCED && !PROTO && !options.namespace;

  var nativeSource = GLOBAL ? globalThis : STATIC ? globalThis[TARGET] : globalThis[TARGET] && globalThis[TARGET].prototype;

  var target = GLOBAL ? path : path[TARGET] || (path[TARGET] = create(null));
  var targetPrototype = options.real && target.prototype;

  Object.keys(source).forEach(function (key) {
    var USE_NATIVE = !FORCED && nativeSource && hasOwn(nativeSource, key);
    // Forced constructor exports can still reuse a native.
    var nativeProperty;
    if (nativeSource && (USE_NATIVE || options.constructor === true)) nativeProperty = nativeSource[key];
    USE_NATIVE = USE_NATIVE && nativeProperty !== undefined;
    var baseResultProperty = USE_NATIVE ? nativeProperty : source[key];

    var targetProperty = (canHaveStatics || checkExisting) && target[key];
    if (checkExisting && typeof targetProperty == typeof baseResultProperty) return;

    var previous = canHaveStatics && typeof targetProperty == 'object' && targetProperty;
    var nativeNamespace = options.namespace && USE_NATIVE;

    // make static versions of prototype methods
    var resultProperty = PROTO && isCallable(baseResultProperty) ? uncurryThis(baseResultProperty)
      // bind methods to global for calling from export context
      : options.bind && USE_NATIVE ? baseResultProperty.bind(globalThis)
      // wrap global constructors for prevent changes in this version
      : options.wrap && USE_NATIVE ? wrapConstructor(baseResultProperty, options.arity)
      // The module supplies the namespace object. Previously exported statics take precedence.
      : nativeNamespace ? copyOwnProperties(baseResultProperty, source[key], previous)
      // default case
      : baseResultProperty;

    if (options.constructor === true && isCallable(resultProperty) && resultProperty !== nativeProperty) {
      defineBuiltIn(resultProperty, 'prototype', resultProperty.prototype, { nonWritable: true, nonConfigurable: true });
    }

    // add a flag to not completely full polyfills without modifying natives used as is
    if (resultProperty !== nativeProperty
      && (options.sham || (baseResultProperty && baseResultProperty.sham))) {
      createNonEnumerableProperty(resultProperty, 'sham', true);
    }

    var descriptor = STATIC && getOwnPropertyDescriptor(USE_NATIVE ? nativeSource : target, key);
    if (USE_NATIVE && descriptor && !options.nonWritable && hasOwn(descriptor, 'writable')) {
      descriptor.value = resultProperty;
      if (options.enumerable) descriptor.enumerable = true;
      if (options.nonConfigurable) descriptor.configurable = false;
      defineProperty(target, key, descriptor);
    } else if (!USE_NATIVE && descriptor && !descriptor.configurable) {
      // A non-configurable property on the pure target can still be writable.
      if (descriptor.writable) defineProperty(target, key, { value: resultProperty, writable: !options.nonWritable });
    } else defineBuiltIn(target, key, resultProperty, options);

    if (previous && !nativeNamespace) copyOwnProperties(previous, resultProperty);

    if (PROTO) {
      var VIRTUAL_PROTOTYPE = TARGET + 'Prototype';
      if (!hasOwn(path, VIRTUAL_PROTOTYPE)) {
        createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, create(null));
      }
      // export virtual prototype methods
      createNonEnumerableProperty(path[VIRTUAL_PROTOTYPE], key, baseResultProperty);
      // export real prototype methods
      if (targetPrototype && (FORCED || !targetPrototype[key])) {
        createNonEnumerableProperty(targetPrototype, key, baseResultProperty);
      }
    }
  });
};
