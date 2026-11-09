import _at from "@core-js/pure/actual/instance/at";
// The receiver guard covers the plain tail beyond a live optional call.
export function read(a) {
  return a == null ? void 0 : _at(a).call(a, 0).foo?.().bar;
}