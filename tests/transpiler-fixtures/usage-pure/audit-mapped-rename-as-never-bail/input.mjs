// `as never` filters every member out of the result type. expansion returns an empty
// member list, so the original property name (`a`) doesn't exist in the renamed mapped
// type and the receiver lookup falls through to generic `_at`. graceful-bail check
type DropAll<T> = { [K in keyof T as never]: T[K] };
declare const r: DropAll<{ a: number[] }>;
r.a.at(0);
