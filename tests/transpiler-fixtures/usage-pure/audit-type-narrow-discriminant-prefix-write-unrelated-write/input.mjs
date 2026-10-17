// a write to a PREFIX of the discriminant path replaces the object that holds it, so the
// guarded variant no longer describes the value: `u.m = other.m` invalidates a narrow taken
// under `u.m.k === 'a'` exactly like writing `u.m.k` itself would
type Multi = { m: { k: 'a'; }; val: string; other: number; } | { m: { k: 'b'; }; val: number[]; other: number; };
// an UNRELATED field write leaves the discriminant intact - the narrow survives
export function unrelatedWrite(u: Multi) {
  if (u.m.k === 'a') {
    u.other = 5;
    return u.val.at(0);
  }
  return undefined;
}
