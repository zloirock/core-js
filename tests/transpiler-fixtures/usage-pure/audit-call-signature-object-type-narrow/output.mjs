import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3;
// a callable object type - written as a call signature in an object type literal (`{ (): T }`) or
// in an interface (`interface Fn { (): T }`) - is the same runtime shape as `() => T`. its call
// result used to fall back to the generic helper because the signature was not peeled out of the
// object type; it now narrows like the equivalent arrow type, including a generic one whose outer
// type-arg is substituted into the return. distinct receivers / methods trace each line.
type Make<T> = {
  (): T;
};
declare const makeString: {
  (): string;
};
export const a = _atMaybeString(_ref = makeString()).call(_ref, 0);
declare const makeNumbers: Make<number[]>;
export const b = _includesMaybeArray(_ref2 = makeNumbers()).call(_ref2, 0);
interface Callable {
  (): string[];
}
declare const makeStrings: Callable;
export const c = _atMaybeArray(_ref3 = makeStrings()).call(_ref3, 0);