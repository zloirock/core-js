// explicit grouping around TS as-cast / satisfies operand of an increment/decrement
let m = Map;
let s = Set;
((m satisfies Function))++;
((s as any))--;
