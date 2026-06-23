import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// `new C()` on a value typed with a construct signature (`{ new (): T }`, or a constructable
// interface) narrows on the constructed instance - the `new`-context mirror of how a call
// signature narrows a call. crucially the two contexts use DIFFERENT signatures: `new` on a
// call-ONLY type does NOT borrow the call return, so it stays unresolved (the last line keeps
// its native `.flat`, no polyfill injected). distinct methods trace each line.
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
type CallOnly = {
  (): number[];
};
declare const callOnly: CallOnly;
export const c = new callOnly().flat();