import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// The selected object member distinguishes the two conditional branches.
type Wrap<T> = T extends string ? {
  foo: string;
} : {
  foo: number[];
};
declare const text: Wrap<string>;
declare const data: Wrap<number>;
_includesMaybeString(_ref = text.foo).call(_ref, 'a');
_atMaybeArray(_ref2 = data.foo).call(_ref2, 0);
export {};