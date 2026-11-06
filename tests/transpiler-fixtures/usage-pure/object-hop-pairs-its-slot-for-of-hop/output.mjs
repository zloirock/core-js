import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A literal-object for-of element keeps its native nested Map read.
// The independent body push call remains polyfilled.
function forOfHop() {
  const out = [];
  for (const {
    w: {
      Map: viaHeadCtor
    }
  } of [{
    w: _globalThis
  }]) _pushMaybeArray(out).call(out, viaHeadCtor);
  return out;
}
export default [forOfHop()];