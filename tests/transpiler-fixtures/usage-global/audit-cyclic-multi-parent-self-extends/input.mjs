// `Tree` extends two SELF-cyclic interfaces (`A extends A`, `B extends B`); Tree itself is a
// plain interface. A cycle hit while walking the first parent must not poison the second
// parent's sub-walk - otherwise the type masquerades as Object and the array `includes`
// polyfill is dropped. Cyclic-but-unknowable receiver still falls through to the array
// polyfill (safe over-emit), never suppressed.
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface A extends A {}
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface B extends B {}
interface Tree extends A, B {}
declare const t: Tree;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
t.includes(0);
