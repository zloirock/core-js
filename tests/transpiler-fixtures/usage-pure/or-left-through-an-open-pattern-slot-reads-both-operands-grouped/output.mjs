import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
var _ref;
// a `||` / `??` or a presence test whose left reads a name a pattern binds to a slot holding no one certain
// value - one a write replaced or a call it escapes to may replace, one a spread may shift, one of a
// container a write may replace, and an alias of such a name - decides nothing: the slot may hold a falsy
// value, so the right is read too. a slot captured before its write, and one nothing writes, decide
const box = {
  C: _Map
};
box.C = null;
const {
  C: M
} = box;
export const grouped = (_ref = M || Object, _ref === Object ? _Object$groupBy : _ref.groupBy);