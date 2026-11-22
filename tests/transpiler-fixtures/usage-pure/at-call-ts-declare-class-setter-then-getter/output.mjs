import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
declare class Store {
  set value(value: number[]);
  get value(): string;
}
declare const s: Store;
// Reads use the getter type even when the setter is declared first.
_atMaybeString(_ref = s.value).call(_ref, 0);