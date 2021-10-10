/* eslint-disable no-unused-vars -- required for functions `.length` */
var $ = require('../internals/export');
var wrapErrorConstructorWithCause = require('../internals/wrap-error-constructor-with-cause');

var FORCED = Error('e', { cause: 7 }).cause !== 7;

$({ global: true, forced: FORCED }, {
  Error: wrapErrorConstructorWithCause('Error', function (init) {
    return function Error(message) { return init.apply(this, arguments); };
  }, FORCED),
  EvalError: wrapErrorConstructorWithCause('EvalError', function (init) {
    return function EvalError(message) { return init.apply(this, arguments); };
  }, FORCED),
  RangeError: wrapErrorConstructorWithCause('RangeError', function (init) {
    return function RangeError(message) { return init.apply(this, arguments); };
  }, FORCED),
  ReferenceError: wrapErrorConstructorWithCause('ReferenceError', function (init) {
    return function ReferenceError(message) { return init.apply(this, arguments); };
  }, FORCED),
  SyntaxError: wrapErrorConstructorWithCause('SyntaxError', function (init) {
    return function SyntaxError(message) { return init.apply(this, arguments); };
  }, FORCED),
  TypeError: wrapErrorConstructorWithCause('TypeError', function (init) {
    return function TypeError(message) { return init.apply(this, arguments); };
  }, FORCED),
  URIError: wrapErrorConstructorWithCause('URIError', function (init) {
    return function URIError(message) { return init.apply(this, arguments); };
  }, FORCED)
});
