// A loop back-edge re-runs more than the body: the for TEST and UPDATE, the while/do-while TEST and the for-in/of LEFT (its
// pattern defaults and computed keys) all re-execute per iteration, so an alias-keyed static read there observes a textually-later
// write on iteration 2+ and reaches BOTH keys - usage-global injects the union of the reachable statics.
export function inForTest(stop) {
  let kTest = "from";
  for (; Array[kTest]([1]).length && !stop(); kTest = "of") {}
}
