import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// CALLABLE-INTERSECTION: an intersection of call signatures does NOT resolve first-match - the
// result widens to the generic helper whatever the order of the members, so neither spelling below
// narrows. overload declarations are the shape that DOES take the first signature, and it narrows
// to that signature's return type - the two must not be conflated
declare const arrayFirst: (() => string[]) & (() => string);
export const a = _at(_ref = arrayFirst()).call(_ref, 0);
declare const stringFirst: (() => string) & (() => string[]);
export const b = _at(_ref2 = stringFirst()).call(_ref2, 0);
declare function overloaded(): string[];
declare function overloaded(): string;
export const d = _atMaybeArray(_ref3 = overloaded()).call(_ref3, 0);