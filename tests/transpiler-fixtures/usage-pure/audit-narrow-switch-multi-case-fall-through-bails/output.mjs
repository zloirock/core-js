import _includes from "@core-js/pure/actual/instance/includes";
// multi-step fall-through chain: mutation lives two cases back, separated by an empty
// intermediate case. `fallThroughCaseViolates` must walk back through every fall-through
// predecessor, not just the immediate one
function probe(arg: string | number[]) {
  let x: string | number[] = arg;
  switch (typeof x) {
    case "string":
      x = [1, 2, 3];
    case "boolean":
    case "object":
      return _includes(x).call(x, 1);
  }
  return false;
}
probe("hi");