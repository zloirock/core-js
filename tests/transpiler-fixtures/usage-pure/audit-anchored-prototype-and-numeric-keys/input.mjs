// Object.prototype key names inside a hop must NOT resolve through the definition
// tables ('constructor' / 'hasOwnProperty' / '__proto__' are not polyfill entries) -
// they stay residual reads off the anchored binding, like a numeric key
const { Map: { constructor: C, hasOwnProperty: H } } = globalThis;
const { Promise: { 0: zero, __proto__: P } } = globalThis;
console.log(C, H, zero, P);
