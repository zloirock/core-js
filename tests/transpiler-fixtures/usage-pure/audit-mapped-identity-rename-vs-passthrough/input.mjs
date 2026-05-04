// Identity rename (`as K`) with a passthrough body (`T[K]`) is structurally equivalent to
// the trivial passthrough form. unwrapMappedTypePassthrough rejects when nameType is set,
// so this routes through expandMappedTypeMembers. Each line touches a different field type
// so per-key dispatch is observable.
type IdentityRename<T> = { [K in keyof T as K]: T[K] };
declare const r: IdentityRename<{ data: number[]; tag: string }>;
r.data.at(0);
r.tag.includes('a');
