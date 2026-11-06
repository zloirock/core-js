import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// a kept WRITE the source reads through an enclosing SEQUENCE takes the same collapse as the write
// read directly: the sequence hands its tail on, so the realm hop above it reads the value that
// write stored. the `?.` there guards the always-defined store and is dead, the tail folds, and the
// base is the ROOT binding the collapse landed - the sequence prefix re-emits where the source ran it
let v, out;
// NEGATIVE: a tail hop the pure build CAN back is no realm self-reference the fold takes
let g4;
export const backedTail = (g4 = _globalThis, v = _self, _Number$MAX_SAFE_INTEGER);
export { v };