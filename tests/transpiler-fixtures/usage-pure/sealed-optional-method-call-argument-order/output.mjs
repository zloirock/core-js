import _at from "@core-js/pure/actual/instance/at";
// A sealed optional lookup still evaluates arguments before a missing callee rejects.
export function read(receiver, argument, key) {
  return ((receiver == null ? void 0 : _at(receiver)) || 0).call(receiver, argument());
}