// receiver-copy vs re-read-observability boundary. a literal nesting a member READ (`Map.prototype`)
// must NOT be emitted twice - the read would re-fire on the copy - but a SOLE binding reads it once,
// so the eliminate-residual extraction still emits it (single read, like native). identifier-only
// literals stay freely copyable. every nested global substitutes the same as babel's re-traversed
// clone (a raw global would ReferenceError on an engine lacking it). each declaration uses a
// distinct instance method so the emitted copy is attributable to its receiver shape.
const flag = true;
const { y: { at: a } } = { y: [Map.prototype] };
const { z: { includes: b } } = { z: [flag ? Set : WeakMap] };
const { w: { flat: c } } = { w: [{ [Promise]: 1 }] };
export const r = [a, b, c];
