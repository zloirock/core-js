import _globalThis from "@core-js/pure/actual/global-this";
import _Object$assign from "@core-js/pure/actual/object/assign";
// a computed key that folds to no name at all cannot be replayed without re-running it, so the
// whole pattern takes the body fallback - the one emission left that ignores what the caller passed
const dynamicComputedKey = function ({
  [_globalThis.pick]: picked
} = Object) {
  let assign = _Object$assign;
  return [picked, assign];
}();
export { dynamicComputedKey };