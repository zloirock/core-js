// A pre-polyfilled static extraction and its residual rest pattern stay unchanged on a second pass.
// Keep the serving import beside its sentinel: together they identify the earlier claim.
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set";
const groupBy = _Map$groupBy;
const {
  Map: {
    groupBy: _unused,
    ...grouped
  } = _Set
} = _globalThis;
export { groupBy, grouped };