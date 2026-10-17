import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// NEGATIVE: a key alias REASSIGNED inside a loop is live under both values - the dispatch
// keeps its own guard on every pass
export const loopOut = [];
let loopKey = 'from';
export function viaLoopReassignedKey() {
  for (let i = 0; i < 2; i++) {
    (_pushMaybeArray(loopOut) || 0).call(loopOut, Array[loopKey]?.([1]));
    loopKey = 'of';
  }
}