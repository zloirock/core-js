import _Promise from "@core-js/pure/actual/promise/constructor";
// assignment-pattern in destructure where the value position is a reference to a
// binding: the binding read still routes through pure-mode polyfill rewrites.
const {
  x = _Promise
} = obj;
function f(y = _Promise) {}