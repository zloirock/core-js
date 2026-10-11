// an importer reads an exported binding LIVE, so every value written to it leaves the file, not only its
// initializer: a later write, one inside a function, a pattern's slot - the constructor each one holds takes the
// whole entry. a binding the module keeps to itself keeps the narrow one
export let P;
P = Promise;
export var M;
export function init() {
  M = Map;
}
export let I;
({ Iterator: I } = globalThis);
let kept;
kept = WeakSet;
export const size = new kept().has({});
