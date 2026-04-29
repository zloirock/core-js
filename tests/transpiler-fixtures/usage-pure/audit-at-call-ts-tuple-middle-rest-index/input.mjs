// middle-rest tuple `[a, ...string[], boolean]` is the same positional ambiguity as the
// leading-rest case but with a fixed prefix: `T[0]` resolves to `number` (before the
// rest, deterministic) while `T[2]` could be either `string` (rest hold 2+ elems) or
// `boolean` (rest is empty). bail covers any index AT or PAST the rest position when the
// rest sits anywhere except last
type Mixed = [number, ...string[], boolean];
declare const m: Mixed;
m[2].at(0);
