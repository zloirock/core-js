import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
type Future<T> = {
  then(cb: (value: T) => unknown): unknown;
};
declare const future: Future<string>;
_atMaybeString(_ref = await future).call(_ref, 0);
export {};