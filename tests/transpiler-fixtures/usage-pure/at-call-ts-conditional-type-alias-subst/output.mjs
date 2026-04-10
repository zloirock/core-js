var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
type Box<T> = {
  get(): T extends string ? T : never;
};
declare const b: Box<string>;
_atMaybeString(_ref = b.get()).call(_ref, -1);