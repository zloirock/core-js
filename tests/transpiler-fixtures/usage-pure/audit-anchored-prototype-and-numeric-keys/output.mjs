import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Object.prototype key names inside a hop must NOT resolve through the definition
// tables ('constructor' / 'hasOwnProperty' / '__proto__' are not polyfill entries) -
// they stay residual reads off the anchored binding, like a numeric key
const {
  constructor: C,
  hasOwnProperty: H
} = _Map;
const {
  0: zero,
  __proto__: P
} = _Promise;
console.log(C, H, zero, P);