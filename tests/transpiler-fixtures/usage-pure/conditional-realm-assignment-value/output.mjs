import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A conditional assignment preserves its realm result and binds the pure constructor.
function read(enabled) {
  var _ref;
  let C;
  const realm = enabled && (C = _Map, _globalThis);
  if (!enabled) return [realm, C];
  const method = C === _Map ? _Map$groupBy : (_ref = C.groupBy) === void 0 ? 'fallback' : _ref;
  return [realm === _globalThis, typeof method];
}
export const result = [read(true), read(false)];