// An independent read of a typed array method still requests its polyfill.
// This control is isolated from writes to other methods on the receiver.
const g1: number[] = [1];
export const r6 = g1.includes(1);
