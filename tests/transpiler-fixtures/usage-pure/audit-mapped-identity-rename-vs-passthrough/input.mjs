// Identity rename `as K` is structurally a passthrough but blocks the fast-path because nameType is set.
// Expansion must still produce concrete members so per-field dispatch picks Array vs String narrows.
type IdentityRename<T> = { [K in keyof T as K]: T[K] };
declare const r: IdentityRename<{ data: number[]; tag: string }>;
r.data.at(0);
r.tag.includes('a');
