// 5-deep chain on a 3-deep array: element-tracking runs out at level 4, whose receiver is a
// number, so that level matches no variant and stays raw. level 5 then reads its receiver off
// that unresolved call and has no type at all, which is what selects the type-agnostic entry -
// the emitted name is the proof: an array receiver would have taken the array-specific helper
// and a bottomed-out primitive would have taken nothing.
// chain-depth coverage: same method per level is intentional, drives chain-walker reach
const arr = [[[1]], [[2]]];
arr.at(0)?.at(0).at(0).at(0).at(0);
