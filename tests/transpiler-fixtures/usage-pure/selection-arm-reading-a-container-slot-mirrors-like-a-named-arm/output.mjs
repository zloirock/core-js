import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// an arm of a selection reading a container slot that holds a constructor mirrors that constructor's
// statics like a named arm does - a key the literal does not serve re-reads the slot as spelled - down a
// deeper path or through a computed realm hop alike
const shelf = {
  M: _Map
};
const {
  groupBy,
  extra
} = flag ? {
  groupBy: _Map$groupBy,
  extra: shelf.M.extra
} : {
  groupBy: _Object$groupBy,
  extra: Object.extra
};
const nest = {
  inner: {
    P: _Promise
  }
};
const {
  allSettled
} = flag ? {
  allSettled: _Promise$allSettled
} : Object;
const {
  of
} = flag ? {
  of: _Array$of
} : _Set;