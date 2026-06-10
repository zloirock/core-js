// a NESTED destructure in a parameter DEFAULT (AssignmentPattern host): the wrapper peel must
// stop AT the param-level AssignmentPattern (its right side IS the receiver) instead of walking
// past it onto the param slot - peeling through dropped the injection for the nested form while
// the flat `{ from } = Array` param worked
function f({ Array: { from } } = globalThis) {
  return from([1, 2]);
}
f();
