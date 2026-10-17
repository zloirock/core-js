import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// An exported function, an escaped function and a callback have unknown callers.
// Global injects each instance method; pure dispatches on each actual incoming receiver.
export function exposed(_ref, _unused = void 0) {
  let at = _at(_ref);
  return at;
}
function escaping(_ref2, _unused2 = void 0) {
  let includes = _includes(_ref2);
  return includes;
}
hand(escaping);
subscribe((_ref3, _unused3 = void 0) => {
  let concat = _concatMaybeArray(_ref3);
  return concat;
});