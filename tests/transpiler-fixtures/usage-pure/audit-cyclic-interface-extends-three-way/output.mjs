import _at from "@core-js/pure/actual/instance/at";
// three-way cyclic interface chain `A -> B -> C -> A`: cycle detection bails through every
// link (C sees A already in progress, flag propagates back to B and A). receiver type is
// null at each level; `.at(0)` resolves to the generic instance-method polyfill
interface A extends B {}
interface B extends C {}
interface C extends A {}
declare const x: A;
_at(x).call(x, 0);