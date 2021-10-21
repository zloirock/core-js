var global = require('../internals/global');
var toPositiveInteger = require('../internals/to-positive-integer');

var RangeError = global.RangeError;

module.exports = function (it, BYTES) {
  var offset = toPositiveInteger(it);
  if (offset % BYTES) throw RangeError('Wrong offset');
  return offset;
};
