import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a TS expression wrapper around the IIFE argument peels on the way in: the synth literal lands
// inside the wrapper and the receiver still types from the underlying literal
export const viaAsConstArg = ((_ref, _unused = void 0) => {
  let at = _atMaybeArray(_ref);
  return at;
})([1, 2] as const);