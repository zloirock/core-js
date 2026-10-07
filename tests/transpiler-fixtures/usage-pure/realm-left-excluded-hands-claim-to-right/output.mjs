import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
// A `||` / `??` left naming a built-in the build is told not to inject counts as no built-in: an engine
// lacking it runs the right, which keeps its mirror (`from`). A static the filter keeps still claims off
// the left (`Iterator.concat`).
const {
  from
} = _globalThis.Iterator || {
  from: _Array$from
};
const concat = _Iterator$concat;
export { from, concat };