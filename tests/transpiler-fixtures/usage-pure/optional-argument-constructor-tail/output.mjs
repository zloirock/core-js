import _Map from "@core-js/pure/actual/map/constructor";
// Retyping the argument chain cannot remove the enclosing method short-circuit.
export function read(o) {
  return o?.log(null == window ? void 0 : _Map.length);
}