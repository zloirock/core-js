import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
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