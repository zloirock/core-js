import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
// a loop back-edge re-runs more than the body: the for TEST and UPDATE, the while/do-while
// TEST and the for-in/of LEFT (its pattern defaults and computed keys) all re-execute per
// iteration, so an alias-keyed static read there observes a textually-later write on iteration
// 2+ and must NOT resolve the first-iteration key. the for INIT and the for-of RIGHT run once
// per entry, so reads there still resolve. distinct constructor per cell so each import set is
// attributable
let kTest = "from";
export function inForTest(stop) {
  for (; Array[kTest]([1]).length && !stop(); kTest = "of") {}
}
let kWhile = "ownKeys";
export function inWhileTest(obj, step) {
  while (_Reflect[kWhile](obj).length && step()) {
    kWhile = "has";
  }
}
let kLeft = "parseFloat";
export function inForOfLeftDefault(items) {
  for (const {
    m = Number[kLeft]("1.5")
  } of items) {
    kLeft = "isInteger";
  }
}
let kIn = "trunc";
const sink = {};
export function inForInLeftKey(obj) {
  for (sink[Math[kIn](1.5)] in obj) {
    kIn = "sign";
  }
}
// once-per-entry slots keep resolving
let kInit = "fromEntries";
export function inForInit(n) {
  for (let acc = _Object$fromEntries([["a", 1]]); n--; kInit = "keys") {
    acc = acc;
  }
}
let kRight = "fromCodePoint";
export function inForOfRight() {
  for (const ch of _String$fromCodePoint(66, 67)) {
    kRight = "raw";
  }
}
// a for-UPDATE write runs 0+ times (never on a zero-iteration loop), so it must not pin the
// post-loop static to the updated key
let kP = "allSettled";
export function afterLoop(c) {
  for (; c(); kP = "any");
  return _Promise[kP]([1]);
}