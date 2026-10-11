import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
var _ref;
// an enum or a namespace binds a runtime object no binding view carries a declarator for: read as an
// operand of a selection, a for-of element, an `in` test or a destructure it is the user's own value, never
// a container literal or a built-in, and every claim through it keeps its live read. a const enum read as a
// value is a TypeScript error the parsers and the transform still accept
enum E {
  A,
  from = 2,
}
const enum K {
  A,
}
namespace N {
  export const from = 1;
}
namespace Outer.Inner {
  export const from = 1;
}
export const viaOr = (_ref = E || Object, _ref === Object ? _Object$groupBy([], f) : _ref.groupBy([], f));
export const viaNullish = (N ?? {}).from;
export const viaTernary = (c ? Outer : _Map).groupBy([], f);
export const viaConstEnum = K || {};
for (const M of [E, _Map]) {
  var _ref2;
  use((_ref2 = M || Object, _ref2 === Object ? _Object$groupBy([], f) : _ref2.groupBy([], f)));
}
export const viaIn = 'groupBy' in (N || _Map);
export const {
  groupBy
} = Outer || {
  groupBy: _Map$groupBy
};