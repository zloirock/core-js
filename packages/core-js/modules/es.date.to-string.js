var uncurryThis = require('../internals/function-uncurry-this');
var redefine = require('../internals/redefine');

var DatePrototype = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var un$DateToString = uncurryThis(DatePrototype[TO_STRING]);
var getTime = uncurryThis(DatePrototype.getTime);

// `Date.prototype.toString` method
// https://tc39.es/ecma262/#sec-date.prototype.tostring
if (String(new Date(NaN)) != INVALID_DATE) {
  redefine(DatePrototype, TO_STRING, function toString() {
    var value = getTime(this);
    // eslint-disable-next-line no-self-compare -- NaN check
    return value === value ? un$DateToString(this) : INVALID_DATE;
  });
}
