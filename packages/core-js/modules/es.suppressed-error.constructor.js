// type: proposals/explicit-resource-management.d.ts
'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of-simple');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var installErrorStack = require('../internals/error-stack-install');
var normalizeStringArgument = require('../internals/normalize-string-argument');
var fails = require('../internals/fails');
var IS_PURE = require('../internals/is-pure');

var NativeSuppressedError = globalThis.SuppressedError;
var $Error = Error;
var getPrototypeOf = Object.getPrototypeOf;

// https://github.com/oven-sh/bun/issues/9282
var WRONG_ARITY = !!NativeSuppressedError && NativeSuppressedError.length !== 3;

// https://github.com/oven-sh/bun/issues/9283
var EXTRA_ARGS_SUPPORT = !!NativeSuppressedError && fails(function () {
  return new NativeSuppressedError(1, 2, 3, { cause: 4 }).cause === 4;
});

var PATCH = WRONG_ARITY || EXTRA_ARGS_SUPPORT;

var $SuppressedError = function SuppressedError(error, suppressed, message) {
  var isInstance = isPrototypeOf(SuppressedErrorPrototype, this);
  var that = PATCH && (!isInstance || getPrototypeOf(this) === SuppressedErrorPrototype)
    ? new NativeSuppressedError()
    : setPrototypeOf(new $Error(), isInstance ? getPrototypeOf(this) : SuppressedErrorPrototype);
  if (message !== undefined) createNonEnumerableProperty(that, 'message', normalizeStringArgument(message));
  installErrorStack(that, $SuppressedError, that.stack, 1);
  createNonEnumerableProperty(that, 'error', error);
  createNonEnumerableProperty(that, 'suppressed', suppressed);
  return that;
};

setPrototypeOf($SuppressedError, $Error);

var SuppressedErrorPrototype = $SuppressedError.prototype = PATCH ? NativeSuppressedError.prototype : Object.create($Error.prototype, {
  constructor: createPropertyDescriptor(1, $SuppressedError),
  message: createPropertyDescriptor(1, ''),
  name: createPropertyDescriptor(1, 'SuppressedError'),
});

if (PATCH && !IS_PURE) SuppressedErrorPrototype.constructor = $SuppressedError;

// `SuppressedError` constructor
// https://github.com/tc39/proposal-explicit-resource-management
$({ global: true, constructor: true, arity: 3, forced: PATCH }, {
  SuppressedError: $SuppressedError,
});
