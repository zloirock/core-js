// `tuple.length` is a number; positional indices keep their concrete element types.
// Verifies that the synthetic `length` member doesn't collide with positional element resolution.
type Pair = [string, number[]];
declare const t: Pair;
const len = t.length;
const x = t[1].at(0);
