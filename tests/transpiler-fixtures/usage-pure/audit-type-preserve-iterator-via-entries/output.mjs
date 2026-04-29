import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
// `.entries()` на Array возвращает Iterator. финальный .next() vs .filter() должен
// видеть Iterator type через type-preservation после assign-rewrite. полифил .filter
// на Iterator dispatch'ит iterator-specific helper (не array)
const arr = _Array$from([1, 2]);
const iter = _entriesMaybeArray(arr).call(arr);
iter.filter(([, v]) => v > 0).toArray();