import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// `for (... of (_ref = expr))` / `for (... in (_ref = expr))` - user-authored
// assignment-then-iterate idiom. plugin should treat these as real user assignments
// (reserve the name, don't adopt as orphan ref). without this guard, plugin-generated
// refs could later collide with the user's _ref and clobber the iteration state
let _ref;
for (const x of _ref = [1, 2, 3]) {
  console.log(x, _ref);
}
_atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 0);