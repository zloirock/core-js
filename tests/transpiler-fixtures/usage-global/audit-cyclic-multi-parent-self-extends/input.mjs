// `Tree` extends two SELF-cyclic interfaces (`A extends A`, `B extends B`); Tree itself is a
// plain interface. A cycle hit while walking the first parent must not poison the second
// parent's sub-walk - otherwise the type masquerades as Object and the array `includes`
// polyfill is dropped. Cyclic-but-unknowable receiver still falls through to the array
// polyfill (safe over-emit), never suppressed.
interface A extends A {}
interface B extends B {}
interface Tree extends A, B {}
declare const t: Tree;
t.includes(0);
