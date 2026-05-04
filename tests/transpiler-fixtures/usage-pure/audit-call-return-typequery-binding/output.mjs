import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// `resolveCallReturnTypeFromAnnotation` TSTypeQuery branch: a binding typed as
// `typeof other` must follow the type query to the referenced function's return.
// Here `make` is annotated `() => string[]` indirectly via typeof; result.at(0) should
// narrow to array.
declare function helper(): string[];
declare const make: typeof helper;
const arr = make();
_atMaybeArray(arr).call(arr, 0);
_findLastMaybeArray(arr).call(arr, x => x);