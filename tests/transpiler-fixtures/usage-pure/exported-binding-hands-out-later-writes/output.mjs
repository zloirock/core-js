import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// an importer reads an exported binding LIVE, so every value written to it leaves the file, not only its
// initializer: a later write, one inside a function, a pattern's slot - the constructor each one holds takes the
// whole entry. a binding the module keeps to itself keeps the narrow one
export let P;
P = _Promise;
export var M;
export function init() {
  M = _Map;
}
export let I;
I = _Iterator;
let kept;
kept = _WeakSet;
export const size = new kept().has({});