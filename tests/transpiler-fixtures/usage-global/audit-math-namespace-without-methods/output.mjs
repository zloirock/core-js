import "core-js/modules/es.global-this";
// a VALUE-only usage of a UNIVERSAL namespace injects NOTHING: `Math` exists on every
// supported target and the (much younger) `@@toStringTag` is not the value's concern
export const supported = globalThis.Math ? 'yes' : 'no';
export const escaped = Math;