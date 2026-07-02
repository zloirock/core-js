// deep tuple `[string, ...number[][]]` inside a generic alias still yields the element type
// for `.at(...)` lookup.
type Pair<T> = [string, ...T[]];
declare const t: Pair<number[]>;
t[0].at(0);
t[1].at(0);
