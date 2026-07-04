import _globalThis from "@core-js/pure/actual/global-this";
// a VALUE-only usage of a UNIVERSAL namespace injects NOTHING: `JSON` exists on every
// supported target and the (much younger) `@@toStringTag` is not the value's concern
export const supported = _globalThis.JSON ? 'yes' : 'no';
export const escaped = JSON;