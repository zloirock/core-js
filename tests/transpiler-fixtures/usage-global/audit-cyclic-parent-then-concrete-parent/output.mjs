import "core-js/modules/es.array.at";
// `Tree` extends a SELF-cyclic interface (`A extends A`) followed by a concrete one
// (`B extends Array<number>`). The cycle in the first parent must stay isolated to that
// sub-walk: the second parent still resolves Tree to Array, so `.at` keeps the array
// narrow. No over-bail to the generic polyfill - a healthy sibling wins over a cyclic one.
interface A extends A {}
interface B extends Array<number> {}
interface Tree extends A, B {}
declare const t: Tree;
t.at(0);