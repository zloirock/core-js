import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A conditional assignment preserves its realm result and binds the pure constructor.
function read(enabled) {
  let C;
  const realm = enabled && (C = _Map, _globalThis);
  if (!enabled) return [realm, C];
  const {
    groupBy: method = 'fallback'
  } = C;
  return [realm === _globalThis, typeof method];
}
export const result = [read(true), read(false)];