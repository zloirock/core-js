var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var create = require('../internals/object-create');
var iterate = require('../internals/iterate');
var hide = require('../internals/hide');

var $AgregateError = function AgregateError(errors, message) {
  var that = this;
  if (!(that instanceof $AgregateError)) return new $AgregateError(errors, message);
  if (setPrototypeOf) {
    that = setPrototypeOf(new Error(message), getPrototypeOf(that));
  }
  var errorsArray = [];
  iterate(errors, errorsArray.push, errorsArray);
  that.errors = errorsArray;
  if (message !== undefined) hide(that, 'message', String(message));
  return that;
};

$AgregateError.prototype = create(Error.prototype, {
  constructor: { value: $AgregateError, configurable: true, writable: true },
  name: { value: 'AgregateError', configurable: true, writable: true }
});

require('../internals/export')({ global: true }, {
  AgregateError: $AgregateError
});
