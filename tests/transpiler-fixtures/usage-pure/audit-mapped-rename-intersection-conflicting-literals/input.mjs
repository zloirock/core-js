// evalRenameTemplate intersection branch: two non-string-keyword parts produce
// different concrete strings. helper enforces all-equal: `result !== sub` returns
// null and the mapped-type rename bails to non-passthrough fallback. Confirm we
// don't fold both keys into one name silently.
type Conflict<T> = { [K in keyof T as 'a' & 'b']: T[K] };
declare const r: Conflict<{ items: number[]; nums: number[] }>;
r.items.at(0);
r.nums.at(1);
