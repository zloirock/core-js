import _Array$from from "@core-js/pure/actual/array/from";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// type preservation через 3 промежуточные binding'а: каждый шаг возвращает Array. финальный
// .at(-1) должен dispatch'ить _atMaybeArray (Array-narrowed), не generic _at
const a = _Array$from([1]);
const b = _concatMaybeArray(a).call(a, [2]);
const c = _sliceMaybeArray(b).call(b, 0);
_atMaybeArray(c).call(c, -1);