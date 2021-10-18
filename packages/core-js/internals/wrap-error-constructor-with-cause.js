'use strict';
var getBuiltIn = require('../internals/get-built-in');
var global = require('../internals/global');
var apply = require('../internals/function-apply');
var hasOwn = require('../internals/has-own-property');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var inheritIfRequired = require('../internals/inherit-if-required');
var installErrorCause = require('../internals/install-error-cause');
var IS_PURE = require('../internals/is-pure');

module.exports = function (ERROR_NAME, wrapper, FORCED, IS_AGGREGATE_ERROR) {
  var OPTIONS_POSITION = IS_AGGREGATE_ERROR ? 2 : 1;
  var OriginalError = getBuiltIn(ERROR_NAME);

  if (!OriginalError) return;

  var OriginalErrorPrototype = OriginalError.prototype;

  // V8 9.3- bug https://bugs.chromium.org/p/v8/issues/detail?id=12006
  if (!IS_PURE && hasOwn(OriginalErrorPrototype, 'cause')) delete OriginalErrorPrototype.cause;

  if (!FORCED) return OriginalError;

  var BaseError = getBuiltIn('Error');

  var WrappedError = wrapper(function () {
    var result = apply(OriginalError, this, arguments);
    if (this && this !== global) inheritIfRequired(result, this, WrappedError);
    if (arguments.length > OPTIONS_POSITION) installErrorCause(result, arguments[OPTIONS_POSITION]);
    return result;
  });

  WrappedError.prototype = OriginalErrorPrototype;

  if (ERROR_NAME !== 'Error') {
    if (setPrototypeOf) setPrototypeOf(WrappedError, BaseError);
    else copyConstructorProperties(WrappedError, BaseError);
  }

  copyConstructorProperties(WrappedError, OriginalError);

  if (!IS_PURE) try {
    OriginalErrorPrototype.constructor = WrappedError;
  } catch (error) { /* empty */ }

  return WrappedError;
};
