import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Symbol-key handling retains call-root and ordinary leaf-key effects in evaluation order.
// An effectful realm-hop key keeps its source read and independent nested claims.
let a = 0;
let b = 0;
const log = [];
const arr = [1, 2];
arr[_globalThis[a++, 'self'].Symbol.iterator];
arr[_self[b++, 'window'].Symbol.iterator];
arr, (() => (_pushMaybeArray(log).call(log, 'call'), _globalThis))(), _pushMaybeArray(log).call(log, 'key'), _getIteratorMethod(arr);
arr, (() => (_pushMaybeArray(log).call(log, 'only'), _globalThis))(), _getIteratorMethod(arr);
arr, (() => (_pushMaybeArray(log).call(log, 'deep'), _globalThis))(), _pushMaybeArray(log).call(log, 'deep-key'), _pushMaybeArray(log).call(log, 'deep-ikey'), _getIteratorMethod(arr);
a;
b;
log;