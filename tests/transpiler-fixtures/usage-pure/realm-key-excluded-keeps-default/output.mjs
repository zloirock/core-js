import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A realm key naming a built-in the build is told not to inject is an unknown slot: an engine lacking it
// takes the inner default, which keeps its mirror (`from`). A key the filter keeps still takes its default
// as dead (`Map`).
const {
  Iterator: {
    from
  } = {
    from: _Array$from
  }
} = _globalThis;
const {
  Map: {
    groupBy
  } = Object
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
export { from, groupBy };