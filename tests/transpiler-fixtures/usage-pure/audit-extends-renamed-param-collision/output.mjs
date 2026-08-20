import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// nested type alias `Inner<T>` reuses the same param name as outer `Outer<T>` -
// each `T` is its own scope per TS spec. `Outer<string>` substitutes outer T into
// `Inner<T>`'s arg slot so Inner's body sees `T=string`; `o.value` is `string[]`,
// dispatch must use array-narrowed `.at`
type Inner<T> = T;
type Outer<T> = {
  value: Inner<T>[];
};
declare const o: Outer<string>;
_atMaybeArray(_ref = o.value).call(_ref, 0);