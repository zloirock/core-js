'use strict';
var $String = String;

// V8 3.31 - 4.6 (Chrome 41-46, io.js 1-3, Node 4-5) skips inherited indices
// beyond the length of a packed array when the key is a number.
// Introduced by the splice optimization in https://issues.chromium.org/42207024#comment5
// Removed from `in` in V8 4.7 by https://github.com/v8/v8/commit/3dc9b122fa9f7d551e05f5b9d7415bcfdcac92db
// V8 fixed the same check in its array methods separately in https://github.com/v8/v8/commit/01d228f3cd0125250bb94f1330f9c697568a4768
var NEEDS_STRING = true;
try {
  var array = [];
  var prototype = { 0: 1 };
  // eslint-disable-next-line es/no-object-setprototypeof -- detection
  var setPrototypeOf = Object.setPrototypeOf;
  if (setPrototypeOf) setPrototypeOf(array, prototype);
  // eslint-disable-next-line no-proto -- fallback for engines without Object.setPrototypeOf
  else array.__proto__ = prototype;
  // With both setters missing, the literal still inherits in V8. IE <= 10 treats __proto__ as an own key.
  NEEDS_STRING = '0' in array ? !(0 in array) : '0' in { __proto__: prototype };
} catch (error) { /* empty */ }

module.exports = function (object, index) {
  return (NEEDS_STRING ? $String(index) : index) in object;
};
