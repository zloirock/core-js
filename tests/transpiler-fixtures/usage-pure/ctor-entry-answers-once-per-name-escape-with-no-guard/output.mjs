import _Promise from "@core-js/pure/actual/promise";
export function escapeWithNoGuard(mk) {
  mk(_Promise);
  return new _Promise(r => r(1));
}