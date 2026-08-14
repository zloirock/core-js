var _Object$entries = require("@core-js/pure/actual/object/entries");
var _Object$values = require("@core-js/pure/actual/object/values");
var _Reflect$ownKeys = require("@core-js/pure/actual/reflect/own-keys");
var _Set = require("@core-js/pure/actual/set/constructor");
// in a SCRIPT a program-level `var` does not create a fresh binding - it aliases the global property
// of that name, which keeps holding the real global until the declarator's own assignment runs. so a
// read before that assignment is a genuine global read and must be served, while a read after it is
// the user's value and must stay native. one global per position so a dropped one shows in the
// import set. the last two are the controls: a read inside a FUNCTION stays shadowed (whether the
// call lands before or after the assignment is not decidable from position), and a declaration with
// no init never overwrites the property, so it never shadows at all
var beforeAssign = _Reflect$ownKeys({
  a: 1
});
var Reflect = 1;
var afterAssign = Reflect;
var headRead = _Object$entries({
  b: 2
});
for (var i = _Object$values({
  c: 3
}); false;) {
  var Object = 1;
}
var Number = 1;
var shadowedRead = Number.isFinite(0);
function insideFunction() {
  return Promise.allSettled([]);
}
var Promise = 1;
var noInitRead = _Set;
var Set;