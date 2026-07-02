import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// indexed access into a generic type whose property is itself an array:
// `Items<string>['data']` reduces to `string[]`, so `.at()` and `.flat()` should
// dispatch to the Array-specific instance polyfills
type Items<T> = {
  data: T[];
};
declare const i: Items<string>['data'];
_atMaybeArray(i).call(i, 0);
_flatMaybeArray(i).call(i);