import "core-js/modules/es.array.at";
// A transparent wrapper (paren / TS cast) between a member and its WRITE or TAG host must not defeat the position gates: the
// host's slot holds the wrapper, so identity checks climb to the slot-filling node.
const arr: number[] = [1, 2, 3];
arr.at = function () {
  return 0;
};
export const r1 = arr.at(0);