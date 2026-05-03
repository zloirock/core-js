import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// evalRenameTemplate: nested intrinsic `Capitalize<Uppercase<K>>` - both
// transformers are recognized and composed. Source key 'items' should map
// to 'ITEMS' uppercased then capitalized (still 'ITEMS')
type Pretty<T> = { [K in keyof T as Capitalize<Uppercase<K & string>>]: T[K] };
declare const r: Pretty<{
  items: number[];
  name: string[];
}>;
_atMaybeArray(_ref = r.ITEMS).call(_ref, 0);
_findLastMaybeArray(_ref2 = r.NAME).call(_ref2, x => true);