import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// evalRenameTemplate intersection branch: two non-string-keyword parts produce
// different concrete strings. helper enforces all-equal: `result !== sub` returns
// null and the mapped-type rename bails to non-passthrough fallback. Confirm we
// don't fold both keys into one name silently.
type Conflict<T> = { [K in keyof T as 'a' & 'b']: T[K] };
declare const r: Conflict<{
  items: number[];
  nums: number[];
}>;
_at(_ref = r.items).call(_ref, 0);
_at(_ref2 = r.nums).call(_ref2, 1);