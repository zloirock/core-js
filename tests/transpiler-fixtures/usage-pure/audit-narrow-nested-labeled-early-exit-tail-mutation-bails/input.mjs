// nested labeled wrappers around the early-exit if. resolver must peel every
// LabeledStatement layer (not just the innermost) before checking the test slot;
// otherwise the tail reassignment hides behind the outer label and the narrow
// incorrectly survives the fall-through.
function probe() {
  let x: string | number[] = "hi";
  outer: inner: if (typeof x !== "string" || (x = [1, 2, 3], false)) return;
  x.includes(1);
}

probe();
