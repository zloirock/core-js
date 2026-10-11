// a constructor alias a pattern writes takes the write that reaches the read, as one only plain writes reach
// does: the last of a pattern and a plain write, or of two patterns naming different constructors, and the
// one in the arm a presence test the build answers always takes, decide which static the read narrows to. a
// write on one path only leaves the value to the runtime guard, testing every constructor written there
let patternFirst;
({ Promise: patternFirst } = globalThis);
patternFirst = Map;
export const groups = patternFirst.groupBy([1, 2], x => x % 2);
let twoPatterns;
({ Map: twoPatterns } = globalThis);
({ Promise: twoPatterns } = globalThis);
export const settled = twoPatterns.allSettled([]);
let decided;
if (globalThis) ({ Promise: decided } = globalThis);
export const tried = decided.try(() => 1);
let oneArm;
({ Array: oneArm } = globalThis);
if (flag) ({ Iterator: oneArm } = globalThis);
export const copied = oneArm.from([3]);
