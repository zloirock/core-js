// Pre- AND post-siblings around the destructure-with-SE slot. all three initializers
// carry side effects to make ordering observable: pre-sibling `trackA(1)` MUST run
// before the lifted SE `trackB()`, which MUST run before post-sibling `trackC(2)`.
// earlier collapsed-trailing emission moved `trackA` after `trackB`, swapping observable
// effect order under unrelated-looking `var`-hoist semantics.
if (cond) var a = trackA(1), { from } = (trackB(), Array), b = trackC(2);
export { a, from, b };
