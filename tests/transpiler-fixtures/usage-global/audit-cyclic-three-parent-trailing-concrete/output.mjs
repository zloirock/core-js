import "core-js/modules/es.array.includes";
// `Tree` extends THREE parents: two SELF-cyclic interfaces (`A extends A`, `B extends B`)
// followed by a concrete `Arr extends Array<string>`. a cycle in an earlier sibling must
// not bleed forward and poison the trailing concrete parent's resolution (else Tree drops
// to Object and loses the array narrow). with each parent isolated, the concrete parent
// still resolves Tree to Array, so `.includes` keeps the array narrow.
interface A extends A {}
interface B extends B {}
interface Arr extends Array<string> {}
interface Tree extends A, B, Arr {}
declare const t: Tree;
t.includes("x");