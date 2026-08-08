import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
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
// once-per-entry slots keep resolving - at module level the entry happens exactly once
let kInit = "fromEntries";
export let initAcc;
for (let acc = _Object$fromEntries([["a", 1]]); false; kInit = "keys") {
  initAcc = acc;
}
let kRight = "fromCodePoint";
export const rightChars = [];
for (const ch of _String$fromCodePoint(66, 67)) {
  _pushMaybeArray(rightChars).call(rightChars, ch);
  kRight = "raw";
}
// a for-UPDATE write runs 0+ times (never on a zero-iteration loop), so it must not pin the
// post-loop static to the updated key
let kP = "allSettled";
export function afterLoop(c) {
  for (; c(); kP = "any");
  return _Promise[kP]([1]);
}