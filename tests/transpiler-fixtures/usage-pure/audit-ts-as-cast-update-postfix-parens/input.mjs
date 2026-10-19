// explicit grouping around TS as-cast / satisfies operand of an increment/decrement
let m = Map;
let s = Set;
// @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
((m satisfies Function))++;
((s as any))--;
