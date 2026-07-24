// a loop back-edge re-runs more than the body: the for TEST and UPDATE, the while/do-while
// TEST and the for-in/of LEFT (its pattern defaults and computed keys) all re-execute per
// iteration, so an alias-keyed static read there observes a textually-later write on iteration
// 2+ and reaches BOTH keys - usage-global injects the union of the reachable statics. the for INIT
// and the for-of RIGHT run once per loop execution, so reads there still resolve to one static.
// each alias is LOCAL to its function so the loop-rerun mechanism is isolated: a module-scoped alias
// would ALSO union across function re-invocations (the enclosing tail write is re-observed on a later
// call), which would mask a broken loop-rerun union. distinct constructor per cell so each import set
// is attributable
export function inForTest(stop) {
  let kTest = "from";
  for (; Array[kTest]([1]).length && !stop(); kTest = "of") {}
}
export function inWhileTest(obj, step) {
  let kWhile = "ownKeys";
  while (Reflect[kWhile](obj).length && step()) { kWhile = "has"; }
}
export function inForOfLeftDefault(items) {
  let kLeft = "parseFloat";
  for (const { m = Number[kLeft]("1.5") } of items) { kLeft = "isInteger"; }
}
const sink = {};
export function inForInLeftKey(obj) {
  let kIn = "trunc";
  for (sink[Math[kIn](1.5)] in obj) { kIn = "sign"; }
}
// once-per-entry slots keep resolving to a single static
export function inForInit(n) {
  let kInit = "fromEntries";
  for (let acc = Object[kInit]([["a", 1]]); n--; kInit = "keys") { acc = acc; }
}
export function inForOfRight() {
  let kRight = "fromCodePoint";
  for (const ch of String[kRight](66, 67)) { kRight = "raw"; }
}
// a for-UPDATE write runs 0+ times (never on a zero-iteration loop), so it must not pin the
// post-loop static to the updated key
export function afterLoop(c) {
  let kP = "allSettled";
  for (; c(); kP = "any");
  return Promise[kP]([1]);
}
