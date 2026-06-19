// a re-referenceable receiver copied into the instance polyfill's argument must substitute EVERY
// nested global the same as babel's re-traversed clone - across a member chain with a bare-constructor
// root, a computed object key, and a conditional's branches. a raw global would ReferenceError on an
// engine lacking it (and at an eliminate-residual site the in-place import is never emitted). each
// declaration uses a distinct instance method so the emitted copy is attributable to its receiver shape.
const flag = true;
const { y: { at: a } } = { y: [Map.prototype] };
const { z: { includes: b } } = { z: [flag ? Set : WeakMap] };
const { w: { flat: c } } = { w: [{ [Promise]: 1 }] };
export const r = [a, b, c];
