// `interface A extends B; interface B extends A` - cyclic extends chain. `resolveUserDefinedType`
// walks declarations; without cycle detection it'd loop until MAX_DEPTH=64 per name lookup.
// `seen` Set short-circuits at the second visit. compilation must succeed with no polyfill
// emitted (type unresolvable → x.at stays bare)
interface A extends B {}
interface B extends A {}
declare const x: A;
x.at(0);