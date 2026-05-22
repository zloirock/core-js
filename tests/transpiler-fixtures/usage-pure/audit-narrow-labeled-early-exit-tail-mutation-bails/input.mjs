// labeled early-exit guard with tail mutation in the test slot. the label wraps the
// if statement, so the resolver must peel LabeledStatement before checking the test
// slot for mutations. without the peel the test-slot reassignment is invisible and
// an unsound type-specific polyfill fires on the fall-through.
function probe() {
  let x: string | number[] = "hi";
  outer: if (typeof x !== "string" || (x = [1, 2, 3], false)) return;
  x.includes(1);
}

probe();
