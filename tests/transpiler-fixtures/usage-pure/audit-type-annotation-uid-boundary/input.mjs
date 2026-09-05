// a name written in type space claims a UID slot only up to the wrapper node a `:` slot introduces:
// a type-alias RHS and an interface body carry no wrapper and are walked at ANY depth, while anything
// past a `:` is not walked at all. the two memo numbers below prove all three halves at once -
// `_ref` is taken by the flat alias, `_ref2` stays FREE despite being written under a `:`, and
// `_ref3` is taken three levels deep inside a type-argument. distinct method per line.
type Flat = { _ref(): void; };
type Deep = Map<string, Set<{ _ref3(): void; }>>;
declare const v: { _ref2(): void; };
export const r1 = [10, 20].at(0);
export const r2 = [[1], [2]].flat();
export type { Flat, Deep };
export { v };
