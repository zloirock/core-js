// multiple polyfill sites triggering `_ref` allocation - suffix cache should be
// contiguous `_ref, _ref2, _ref3` not skip any values. seed with a user-declared
// `_ref5` to verify the cache advances past it but doesn't skip ahead past other
// fresh slots
var _ref5 = 99;
console.log(_ref5);
function one() { return [1, 2, 3].at(0); }
function two() { return [4, 5, 6].includes(5); }
function three() { return [7, 8, 9].findLast(x => x > 7); }
function four() { return [10, 11, 12].flat(); }
one(); two(); three(); four();
