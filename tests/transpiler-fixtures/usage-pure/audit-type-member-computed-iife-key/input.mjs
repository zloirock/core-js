// A type-literal member accessed through a zero-arg IIFE computed key (`g[(() => 'rows')()]`) folds the
// IIFE to its returned key, so the receiver keeps the typed dispatch on that member: an Array member
// narrows to the array method, a String member to the string method (a single-type method would resolve
// regardless and prove nothing). distinct member/method per line.
interface Grid { rows: number[]; cols: string; cells: number[][]; }
declare const g: Grid;
export const r1 = g[(() => 'rows')()].at(0);
export const r2 = g[(() => 'cols')()].at(0);
export const r3 = g[(() => 'cells')()].flat();
