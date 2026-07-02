// SIBLING BRANCHES both mirror into the synthesized default - every branch is carried (a
// one-branch literal would TypeError the other on the no-argument call). distinct constructors
// and methods show each branch resolved independently
function f({ Array: { from }, Object: { assign } } = globalThis) {
  return [from, assign];
}
f();
