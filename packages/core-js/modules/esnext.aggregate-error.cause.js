var $ = require('../internals/export');
var getBuiltIn = require('../internals/get-built-in');
var wrapErrorConstructorWithCause = require('../internals/wrap-error-constructor-with-cause');

var AGGREGATE_ERROR = 'AggregateError';
var $AggregateError = getBuiltIn(AGGREGATE_ERROR);
var FORCED = $AggregateError && $AggregateError([1], 'e', { cause: 7 }).cause !== 7;

$({ global: true, forced: FORCED }, {
  AggregateError: wrapErrorConstructorWithCause(AGGREGATE_ERROR, function (init) {
    // eslint-disable-next-line no-unused-vars -- required for functions `.length`
    return function AggregateError(errors, message) { return init.apply(this, arguments); };
  }, FORCED, true)
});
