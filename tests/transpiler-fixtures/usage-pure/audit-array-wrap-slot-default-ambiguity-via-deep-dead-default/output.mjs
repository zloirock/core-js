import _Iterator from "@core-js/pure/actual/iterator/constructor";
// deep nesting: a dead default under a sound deep pair extracts the same way
let deepFb = {};
const [[{
  Iterator: I
} = deepFb]] = [[{
  Iterator: _Iterator
}]];
export const viaDeepDeadDefault = _Iterator.range(0, 3);