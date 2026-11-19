// A residual member target reads the pure constructor even when the native constructor is absent.
// Iterator is a function: its own map read needs no Array dispatcher. The pure constructor keeps
// its legacy instance-as-static surface; the controls still read names from function values.
const box = {};
let from;
({ Iterator: { map: box.m, from } } = globalThis);
export const anchored = ['m' in box, typeof from];

const { of: { name: staticName } } = Array;
export const staticPonyfillMember = typeof staticName;

let ctorName;
({ Promise: { name: ctorName } } = globalThis);
export const ctorResidualName = typeof ctorName;
