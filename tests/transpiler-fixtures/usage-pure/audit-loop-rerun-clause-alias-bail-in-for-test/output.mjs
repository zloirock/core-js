// A loop back-edge re-runs more than the body: the for TEST and UPDATE, the while/do-while TEST and the for-in/of LEFT (its
// pattern defaults and computed keys) all re-execute per iteration, so an alias-keyed static read there observes a textually-later
// write on iteration 2+ and must NOT resolve the first-iteration key.
let kTest = "from";
export function inForTest(stop) {
  for (; Array[kTest]([1]).length && !stop(); kTest = "of") {}
}