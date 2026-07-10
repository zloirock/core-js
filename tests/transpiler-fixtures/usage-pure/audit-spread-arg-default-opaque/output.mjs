import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// a SPREAD arg breaks positional inference, but TS still infers the type-param from the
// spread element - the declared default must stay opaque (generic) instead of leaking
// onto a foreign runtime value (ie:11 throw on the real string element)
declare function makeBox<T = number[]>(t: T, u?: T): {
  v: T;
};
declare const arr: string[];
const spreadBox = makeBox(...arr);
export const viaSpread = _at(_ref = spreadBox.v).call(_ref, 0);

// a positional arg still infers the type-param precisely (default unused)
declare const s: string;
const inferredBox = makeBox(s);
export const viaPositional = _includesMaybeString(_ref2 = inferredBox.v).call(_ref2, 'a');