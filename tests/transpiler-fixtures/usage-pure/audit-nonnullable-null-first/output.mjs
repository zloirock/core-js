import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// NonNullable<null | undefined | T[]>: nullable members appear BEFORE T[] in the union.
// resolveNonNullableAnnotation -> resolveAnnotationInContext -> foldUnionTypes which
// drops null/undefined/never via SKIP. probe whether the leading-nullable shape still
// resolves the Array inner correctly (vs trailing-nullable form).
type Cleaned = NonNullable<null | undefined | number[]>;
declare const arr: Cleaned;
const head = _atMaybeArray(arr).call(arr, 0);
const tail = _findLastMaybeArray(arr).call(arr, x => x > 0);
export { head, tail };