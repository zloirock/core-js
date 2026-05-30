import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
type Deep<T> = {
  get(): T extends object ? T extends Array<infer U> ? U[] : never : T;
};
declare const d: Deep<string>;
_atMaybeString(_ref = d.get()).call(_ref, -1);