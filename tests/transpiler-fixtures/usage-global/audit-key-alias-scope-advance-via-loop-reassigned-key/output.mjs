import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// NEGATIVE: a key alias REASSIGNED inside a loop is live under both values - the dispatch
// keeps its own guard on every pass
export const loopOut = [];
let loopKey = 'from';
export function viaLoopReassignedKey() {
  for (let i = 0; i < 2; i++) {
    loopOut.push(Array[loopKey]?.([1]));
    loopKey = 'of';
  }
}