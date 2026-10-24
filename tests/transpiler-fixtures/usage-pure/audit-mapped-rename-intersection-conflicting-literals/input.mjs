// evalRenameTemplate intersection branch: two non-string-keyword parts produce
// different concrete strings. helper enforces all-equal: `result !== sub` returns
// null and the mapped-type rename bails to non-passthrough fallback. Confirm we
// don't fold both keys into one name silently.
type Conflict<T> = { [K in keyof T as 'a' & 'b']: T[K] };
declare const r: Conflict<{ items: number[]; nums: number[] }>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
r.items.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
r.nums.at(1);
