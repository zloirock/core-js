import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// an alias bound through an OBJECT slot holds every arm of the slot's branching value, as the
// array-slot and reassignment spellings of the same union do: the static read reaches each arm
// (inject-if-might in usage-global; usage-pure guards the read on each arm it can name, and a
// default that cannot fire leaves the paired value's static served outright)
// one static per row, so every row is observable by its own module
const {
  a: A
} = {
  a: c ? Array : _Map
};
export const viaTernary = (A === Array ? _Array$from : A.from.bind(A))([1]);
const {
  b: B
} = {
  b: m || Array
};
export const viaLogical = (B === Array ? _Array$of : B.of.bind(B))(2);
const {
  d: D = _Map
} = {
  d: Object
};
export const viaDefault = _Object$hasOwn({}, 'k');
const {
  n: {
    e: E
  }
} = {
  n: {
    e: c ? _Map : Object
  }
};
export const viaNested = (E === _Map ? _Map$groupBy : E === Object ? _Object$groupBy : E.groupBy.bind(E))([4], x => x);