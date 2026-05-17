// early-exit narrowing pattern: `if (negate-guard) return;` flips the binding to the
// positive type after the early-exit sibling. but if the early-exit's OWN test slot has
// an OR-side mutation that fires on the fall-through path (typeof matches -> RHS evaluates
// -> false -> no return -> mutated value reaches the use), narrow is unsound
function probe() {
  let x: string | number[] = "hi";
  if (typeof x !== "string" || (x = [1, 2, 3], false)) return;
  x.includes(1);
}
probe();
