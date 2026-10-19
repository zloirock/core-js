// three-way cyclic interface chain `A -> B -> C -> A`: cycle detection bails through every
// link (C sees A already in progress, flag propagates back to B and A). receiver type is
// null at each level; `.at(0)` resolves to the generic instance-method polyfill
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface A extends B {}
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface B extends C {}
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface C extends A {}
declare const x: A;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
x.at(0);
