// a write to a PREFIX of the discriminant path replaces the object that holds it, so the
// guarded variant no longer describes the value: `u.m = other.m` invalidates a narrow taken
// under `u.m.k === 'a'` exactly like writing `u.m.k` itself would
type Multi = { m: { k: 'a'; }; val: string; other: number; } | { m: { k: 'b'; }; val: number[]; other: number; };
export function prefixWrite(u: Multi, other: Multi) {
  if (u.m.k === 'a') {
    u.m = other.m;
    return u.val.at(0);
  }
  return undefined;
}
// writing the discriminant's OWN deep path invalidates the variant just as directly - depth is
// not what makes a write irrelevant, landing off the discriminant path is
export function exactWrite(u: Multi) {
  if (u.m.k === 'a') {
    u.m.k = 'b';
    return u.val.includes('x');
  }
  return undefined;
}
// an UNRELATED field write leaves the discriminant intact - the narrow survives
export function unrelatedWrite(u: Multi) {
  if (u.m.k === 'a') {
    u.other = 5;
    return u.val.at(0);
  }
  return undefined;
}
// no write at all keeps the narrow too
export function noWrite(u: Multi) {
  return u.m.k === 'a' ? u.val.at(0) : undefined;
}
