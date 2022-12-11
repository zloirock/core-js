var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var call = require('../internals/function-call');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

var $TypeError = TypeError;

var SetRecord = function (set, size, has, keys) {
  this.set = set;
  this.size = size;
  this.has = has;
  this.keys = keys;
};

SetRecord.prototype = {
  getIterator: function () {
    return anObject(call(this.keys, this.set));
  },
  includes: function (it) {
    return call(this.has, this.set, it);
  }
};

// `GetSetRecord` abstract operation
// https://tc39.es/proposal-set-methods/#sec-getsetrecord
module.exports = function (obj) {
  anObject(obj);
  var numSize = +obj.size;
  // NOTE: If size is undefined, then numSize will be NaN
  // eslint-disable-next-line no-self-compare -- NaN check
  if (numSize != numSize) throw $TypeError('Invalid size');
  return new SetRecord(
    obj,
    toIntegerOrInfinity(numSize),
    aCallable(obj.has),
    aCallable(obj.keys)
  );
};
