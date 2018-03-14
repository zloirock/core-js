var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');
var getIteratorMethod = require('../internals/get-iterator-method');
var isArrayIteratorMethod = require('../internals/is-array-iterator-method');
var bind = require('../internals/bind-context');
var aTypedArrayConstructor = require('../internals/array-buffer-view-core').aTypedArrayConstructor;

module.exports = function from(source /* , mapfn, thisArg */) {
  var O = toObject(source);
  var aLen = arguments.length;
  var mapfn = aLen > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iterFn = getIteratorMethod(O);
  var i, length, values, result, step, iterator;
  if (iterFn != undefined && !isArrayIteratorMethod(iterFn)) {
    for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
      values.push(step.value);
    } O = values;
  }
  if (mapping && aLen > 2) mapfn = bind(mapfn, arguments[2], 2);
  for (i = 0, length = toLength(O.length), result = new (aTypedArrayConstructor(this))(length); length > i; i++) {
    result[i] = mapping ? mapfn(O[i], i) : O[i];
  }
  return result;
};
