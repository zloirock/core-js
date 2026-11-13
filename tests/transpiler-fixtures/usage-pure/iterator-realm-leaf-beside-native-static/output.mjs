import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map/constructor";
// A stable iterator leaf beside another realm field takes the same extraction in both hosts.
const iterator = _getIteratorMethod(_Map);
const {
  Object: {
    fromEntries
  }
} = globalThis;
export { iterator, fromEntries };