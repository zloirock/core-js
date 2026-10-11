// a sloppy script spelling no CommonJS may run bare, its top level the realm itself: a top-level `var` or function
// declaration is then the global object's own slot. what it holds leaves the file as an undeclared name's value
// does, and a constructor it holds loads its whole static family, whether the `var` is initialized with it, written
// later, spelled in a block or bound by a pattern, or a function returns it. a `var` inside a function stays its own
var Promise = self.Promise;
var M;
M = Map;
if (self.flag) {
  var S = Set;
}
var { Symbol: Y } = self;
function iteratorCtor() {
  return Iterator;
}
function local() {
  var W = WeakMap;
  return new W();
}
local();
