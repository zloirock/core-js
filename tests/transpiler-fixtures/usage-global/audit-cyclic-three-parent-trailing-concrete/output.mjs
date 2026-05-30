import "core-js/modules/es.array.includes";
// `Tree` extends THREE parents: two SELF-cyclic interfaces (`A extends A`, `B extends B`)
// followed by a concrete `Arr extends Array<string>`. Each cyclic sibling sets the cycle
// flag; without per-sub-walk isolation that flag bleeds forward and the trailing concrete
// parent's resolution is discarded as poisoned -> Tree masquerades as Object and drops the
// array narrow. Isolated, the concrete parent still resolves Tree to Array, so `.includes`
// keeps the array narrow.
interface A extends A {}
interface B extends B {}
interface Arr extends Array<string> {}
interface Tree extends A, B, Arr {}
declare const t: Tree;
t.includes("x");