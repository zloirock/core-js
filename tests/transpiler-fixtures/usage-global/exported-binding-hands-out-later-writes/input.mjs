// an importer reads an exported binding LIVE, so every value written to it leaves the file, not only its
// initializer: a later write, one inside a function, a pattern's slot - the constructor each one holds loads its
// whole static family. a binding the module keeps to itself loads none
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
