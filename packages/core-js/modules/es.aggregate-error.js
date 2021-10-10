'use strict';
var $ = require('../internals/export');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var create = require('../internals/object-create');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var installErrorCause = require('../internals/install-error-cause');
var iterate = require('../internals/iterate');
var toString = require('../internals/to-string');

var $AggregateError = function AggregateError(errors, message /* , options */) {
  var that = this;
  var options = arguments.length > 2 ? arguments[2] : undefined;
  if (!(that instanceof $AggregateError)) return new $AggregateError(errors, message, options);
  if (setPrototypeOf) {
    // eslint-disable-next-line unicorn/error-message -- expected
    that = setPrototypeOf(new Error(undefined), getPrototypeOf(that));
  }
  if (message !== undefined) createNonEnumerableProperty(that, 'message', toString(message));
  installErrorCause(that, options);
  var errorsArray = [];
  iterate(errors, errorsArray.push, { that: errorsArray });
  createNonEnumerableProperty(that, 'errors', errorsArray);
  return that;
};

if (setPrototypeOf) setPrototypeOf($AggregateError, Error);
else copyConstructorProperties($AggregateError, Error);

$AggregateError.prototype = create(Error.prototype, {
  constructor: createPropertyDescriptor(1, $AggregateError),
  message: createPropertyDescriptor(1, ''),
  name: createPropertyDescriptor(1, 'AggregateError')
});

// `AggregateError` constructor
// https://tc39.es/ecma262/#sec-aggregate-error-constructor
$({ global: true }, {
  AggregateError: $AggregateError
});
