// a loop back-edge re-runs more than the body: the for TEST and UPDATE, the while/do-while
// TEST and the for-in/of LEFT (its pattern defaults and computed keys) all re-execute per
// iteration, so an alias-keyed static read there observes a textually-later write on iteration
// 2+ and must NOT resolve the first-iteration key. the for INIT and the for-of RIGHT run once
// per ENTRY, so reads there still resolve - but only where the entry itself happens once: inside a
// re-invocable function the next call re-runs them AFTER the write, so those cells sit at module
// level to keep the once-per-entry claim true. distinct constructor per cell so each import set is
// attributable
let kTest = "from";
export function inForTest(stop) {
  for (; Array[kTest]([1]).length && !stop(); kTest = "of") {}
}
let kWhile = "ownKeys";
export function inWhileTest(obj, step) {
  while (Reflect[kWhile](obj).length && step()) { kWhile = "has"; }
}
let kLeft = "parseFloat";
export function inForOfLeftDefault(items) {
  for (const { m = Number[kLeft]("1.5") } of items) { kLeft = "isInteger"; }
}
let kIn = "trunc";
const sink = {};
export function inForInLeftKey(obj) {
  for (sink[Math[kIn](1.5)] in obj) { kIn = "sign"; }
}
// once-per-entry slots keep resolving - at module level the entry happens exactly once
let kInit = "fromEntries";
export let initAcc;
for (let acc = Object[kInit]([["a", 1]]); false; kInit = "keys") { initAcc = acc; }
let kRight = "fromCodePoint";
export const rightChars = [];
for (const ch of String[kRight](66, 67)) { rightChars.push(ch); kRight = "raw"; }
// a for-UPDATE write runs 0+ times (never on a zero-iteration loop), so it must not pin the
// post-loop static to the updated key
let kP = "allSettled";
export function afterLoop(c) {
  for (; c(); kP = "any");
  return Promise[kP]([1]);
}
