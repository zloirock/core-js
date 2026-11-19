import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// a destructure slot copies the element value at execution - the READ through the slot keeps
// precision, while the destructured SOURCE binding classifies conservatively as an escape
const [headSlot] = [[7], [8]];
export const viaDestructureSlot = _includesMaybeArray(headSlot).call(headSlot, 7);