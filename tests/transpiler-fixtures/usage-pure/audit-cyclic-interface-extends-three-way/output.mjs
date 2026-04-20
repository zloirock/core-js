import _at from "@core-js/pure/actual/instance/at";
// 3-way cyclic interface chain A → B → C → A. The `hadCycle` piggyback on the visited
// Set propagates through two recursion levels: resolving C hits A (already visited),
// flag bubbles up to B and then A, each owner returns null instead of `$Object('Object')`
interface A extends B {}
interface B extends C {}
interface C extends A {}
declare const x: A;
_at(x).call(x, 0);