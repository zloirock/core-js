import _includes from "@core-js/pure/actual/instance/includes";
// `||` form of the same test-tail mutation: guard via LogicalExpression at the test slot.
// `typeof x !== "string" || (x = [...], false)` - when LHS is false (x is string), RHS
// evaluates and reassigns; then consequent runs with x re-bound to Array
let x: string | number[] = "hi";
if (typeof x !== "string" || (x = [1, 2, 3], false)) {
  // alternate is empty - fall-through path: x narrowed to string by typeof-or coverage,
  // but RHS mutation invalidates narrow
} else {
  _includes(x).call(x, 1);
}