import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map/constructor";
function forOfHop() {
  const out = [];
  for (const {
    w: {
      Map: viaHeadCtor
    }
  } of [{
    w: {
      Map: _Map
    }
  }]) _pushMaybeArray(out).call(out, viaHeadCtor);
  return out;
}
export default [forOfHop()];