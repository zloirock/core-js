require("core-js/modules/es.object.entries");
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.object.values");
require("core-js/modules/es.reflect.own-keys");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.set.constructor");
require("core-js/modules/es.set.species");
require("core-js/modules/es.set.difference");
require("core-js/modules/es.set.intersection");
require("core-js/modules/es.set.is-disjoint-from");
require("core-js/modules/es.set.is-subset-of");
require("core-js/modules/es.set.is-superset-of");
require("core-js/modules/es.set.symmetric-difference");
require("core-js/modules/es.set.union");
require("core-js/modules/es.string.iterator");
require("core-js/modules/web.dom-collections.iterator");
// in a SCRIPT a program-level `var` does not create a fresh binding - it aliases the global property
// of that name, which keeps holding the real global until the declarator's own assignment runs. so a
// read before that assignment is a genuine global read and must be served, while a read after it is
// the user's value and must stay native. one global per position so a dropped one shows in the
// import set. the last two are the controls: a read inside a FUNCTION stays shadowed (whether the
// call lands before or after the assignment is not decidable from position), and a declaration with
// no init never overwrites the property, so it never shadows at all
var beforeAssign = Reflect.ownKeys({
  a: 1
});
var Reflect = 1;
var afterAssign = Reflect;
var headRead = Object.entries({
  b: 2
});
for (var i = Object.values({
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
var noInitRead = Set;
var Set;