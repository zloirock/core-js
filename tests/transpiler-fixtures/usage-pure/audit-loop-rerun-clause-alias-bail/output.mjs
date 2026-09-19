import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
// a loop back-edge re-runs more than the body: the for TEST and UPDATE, the while/do-while
// TEST and the for-in/of LEFT (its pattern defaults and computed keys) all re-execute per
// iteration, so an alias-keyed static read there observes a textually-later write on iteration
// 2+ and must NOT resolve the first-iteration key. the for INIT and the for-of RIGHT run once
// per ENTRY, but a re-invocable function can enter again AFTER the write, so those reads must
// also bail. Distinct constructors keep each cell's import set attributable.
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
// Once-per-entry does not mean once over the lifetime of the outer binding.
let kInit = "fromEntries";
export function inForInit() {
  for (let acc = Object[kInit]([["a", 1]]); false; kInit = "keys") {
    return acc;
  }
}
let kRight = "fromCodePoint";
export function inForOfRight() {
  const chars = [];
  for (const ch of String[kRight](66, 67)) {
    _pushMaybeArray(chars).call(chars, ch);
    kRight = "raw";
  }
  return chars;
}
// a for-UPDATE write runs 0+ times (never on a zero-iteration loop), so it must not pin the
// post-loop static to the updated key
let kP = "allSettled";
export function afterLoop(c) {
  for (; c(); kP = "any");
  return _Promise[kP]([1]);
}