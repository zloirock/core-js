'use strict';
var isCallable = require('../internals/is-callable');
var hasOwn = require('../internals/has-own-property');
var inspectSource = require('../internals/inspect-source');
var InternalStateModule = require('../internals/internal-state');

var enforceInternalState = InternalStateModule.enforce;
var getInternalState = InternalStateModule.get;
var $String = String;
var defineProperty = Object.defineProperty;

var TEMPLATE = $String($String).split('String');

var makeBuiltIn = module.exports = function (value, name, options) {
  name = $String(name);
  if (name.slice(0, 7) === 'Symbol(') name = '[' + name.replace(/^Symbol\(([^)]*)\).*$/, '$1') + ']';
  if (options && options.prefix) name = options.prefix + name;
  if (!hasOwn(value, 'name') || value.name !== name) try {
    defineProperty(value, 'name', { value: name, configurable: true });
  } catch (error) { /* empty */ }
  if (options && hasOwn(options, 'arity') && value.length !== options.arity) try {
    defineProperty(value, 'length', { value: options.arity });
  } catch (error) { /* empty */ }
  try {
    if (options && hasOwn(options, 'constructor') && options.constructor) {
      defineProperty(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwn(state, 'source')) state.source = TEMPLATE.join(name);
  return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn(function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
}, 'toString');
