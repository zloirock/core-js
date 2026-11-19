import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// Construct signatures determine the new receiver, independently of call signatures.
// Array and string methods distinguish the two constructed families.
type Make<T> = {
  new (): T[];
};
declare const makeArray: Make<string>;
export const a = _atMaybeArray(_ref = new makeArray()).call(_ref, 0);
interface MakeString {
  new (): string;
}
declare const makeString: MakeString;
export const b = _includesMaybeString(_ref2 = new makeString()).call(_ref2, "x");