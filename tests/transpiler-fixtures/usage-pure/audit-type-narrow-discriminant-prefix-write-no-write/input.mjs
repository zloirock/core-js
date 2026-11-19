// a write to a PREFIX of the discriminant path replaces the object that holds it, so the
// guarded variant no longer describes the value: `u.m = other.m` invalidates a narrow taken
// under `u.m.k === 'a'` exactly like writing `u.m.k` itself would
type Multi = { m: { k: 'a'; }; val: string; other: number; } | { m: { k: 'b'; }; val: number[]; other: number; };
// no write at all keeps the narrow too
export function noWrite(u: Multi) {
  return u.m.k === 'a' ? u.val.at(0) : undefined;
}
