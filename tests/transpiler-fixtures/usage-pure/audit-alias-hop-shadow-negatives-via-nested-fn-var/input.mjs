// a `var` declared in a NESTED function does not reach the outer use at all
const nestedRoot = Promise;
export function viaNestedFnVar() {
  function inner() { var nestedHeld = nestedRoot; return nestedHeld; }
  { const { race } = nestedHeld; return race([]); }
}
