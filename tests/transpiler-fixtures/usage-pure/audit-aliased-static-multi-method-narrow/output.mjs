import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _Array$of from "@core-js/pure/actual/array/of";
// two distinct aliased statics (`const of = Array.of`, `const from = Array.from`) each
// must narrow their call's return to Array independently. distinct instance methods per
// receiver lock that the two alias registrations don't conflate across receivers
const of = _Array$of;
const from = _Array$from;
const arr1 = of(1, 2, 3);
const arr2 = from('hi');
_atMaybeArray(arr1).call(arr1, -1);
_findLastMaybeArray(arr2).call(arr2, x => x);
_flatMaybeArray(arr1).call(arr1);
_flatMapMaybeArray(arr2).call(arr2, x => x);