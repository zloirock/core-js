// an instance method under two array levels extracts off its captured element where the outer element runs
// an effect ahead of the inner array, the capture keeping the effect where the source wrote it: as a
// sequence, as the fresh-object left of a `||`, and in a decided arm
export const [[{ at }]] = [(mark(), [[]])];
export const [[{ toReversed }]] = [(mark(), [[]]) || [user]];
export const [[{ findLast }]] = [typeof Symbol != 'undefined' ? (mark(), [[]]) : [user]];
