import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Excluding the constructor and its static leaves the original slot and default untouched.
// A static that the filter keeps still replaces its slot and retires that level's default.
const {
  Iterator: {
    from
  } = Array
} = _globalThis;
const {
  Map: {
    groupBy
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
export { from, groupBy };