import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// NonNullable<T & {tag}>: TS spec strips null/undefined from each intersection
// member. resolveNonNullableAnnotation -> resolveAnnotationInContext ->
// resolveTypeAnnotation case TSIntersectionType -> foldIntersectionTypes.
// Plain object literal `{tag: 'a'}` resolves to $Object('Object') (skipped),
// number[] resolves to Array. Result should narrow to Array - probe whether
// intersection passes through correctly with NonNullable wrapper applied.
type Tagged = (number[] & {
  tag: 'arr';
}) | null;
type Stripped = NonNullable<Tagged>;
declare const v: Stripped;
_atMaybeArray(v).call(v, 0);
_findLastMaybeArray(v).call(v, x => true);