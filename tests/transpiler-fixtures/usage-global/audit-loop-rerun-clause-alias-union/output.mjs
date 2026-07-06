import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a loop back-edge re-runs more than the body: the for TEST and UPDATE, the while/do-while
// TEST and the for-in/of LEFT (its pattern defaults and computed keys) all re-execute per
// iteration, so an alias-keyed static read there observes a textually-later write on iteration
// 2+ and reaches BOTH keys - usage-global injects the union of the reachable statics. the for INIT and the for-of RIGHT run once
// per entry, so reads there still resolve. distinct constructor per cell so each import set is
// attributable
let kTest = "from";
export function inForTest(stop) {
  for (; Array[kTest]([1]).length && !stop(); kTest = "of") {}
}
let kWhile = "ownKeys";
export function inWhileTest(obj, step) {
  while (Reflect[kWhile](obj).length && step()) {
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
  for (let acc = Object[kInit]([["a", 1]]); n--; kInit = "keys") {
    acc = acc;
  }
}
let kRight = "fromCodePoint";
export function inForOfRight() {
  for (const ch of String[kRight](66, 67)) {
    kRight = "raw";
  }
}
// a for-UPDATE write runs 0+ times (never on a zero-iteration loop), so it must not pin the
// post-loop static to the updated key
let kP = "allSettled";
export function afterLoop(c) {
  for (; c(); kP = "any");
  return Promise[kP]([1]);
}