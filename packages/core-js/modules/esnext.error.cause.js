/* eslint-disable no-unused-vars -- required for functions `.length` */
var $ = require('../internals/export');
var apply = require('../internals/function-apply');
var wrapErrorConstructorWithCause = require('../internals/wrap-error-constructor-with-cause');

var FORCED = Error('e', { cause: 7 }).cause !== 7;

$({ global: true, forced: FORCED }, {
  Error: wrapErrorConstructorWithCause('Error', function (init) {
    return function Error(message) { return apply(init, this, arguments); };
  }, FORCED)
});

$({ global: true, forced: FORCED }, {
  EvalError: wrapErrorConstructorWithCause('EvalError', function (init) {
    return function EvalError(message) { return apply(init, this, arguments); };
  }, FORCED),
  RangeError: wrapErrorConstructorWithCause('RangeError', function (init) {
    return function RangeError(message) { return apply(init, this, arguments); };
  }, FORCED),
  ReferenceError: wrapErrorConstructorWithCause('ReferenceError', function (init) {
    return function ReferenceError(message) { return apply(init, this, arguments); };
  }, FORCED),
  SyntaxError: wrapErrorConstructorWithCause('SyntaxError', function (init) {
    return function SyntaxError(message) { return apply(init, this, arguments); };
  }, FORCED),
  TypeError: wrapErrorConstructorWithCause('TypeError', function (init) {
    return function TypeError(message) { return apply(init, this, arguments); };
  }, FORCED),
  URIError: wrapErrorConstructorWithCause('URIError', function (init) {
    return function URIError(message) { return apply(init, this, arguments); };
  }, FORCED)
});
