import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// NonNullable<T & {tag}>: TS spec strips null/undefined from each intersection member.
// the plain object literal `{tag: 'a'}` resolves to Object (skipped) while `number[]`
// resolves to Array, so the folded intersection narrows to Array - probe that the
// intersection passes through correctly under the NonNullable wrapper.
type Tagged = (number[] & {
  tag: 'arr';
}) | null;
type Stripped = NonNullable<Tagged>;
declare const v: Stripped;
_atMaybeArray(v).call(v, 0);
_findLastMaybeArray(v).call(v, x => true);