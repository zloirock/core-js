import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// An independent read of a typed array method still requests its polyfill.
// This control is isolated from writes to other methods on the receiver.
const g1: number[] = [1];
export const r6 = _includesMaybeArray(g1).call(g1, 1);