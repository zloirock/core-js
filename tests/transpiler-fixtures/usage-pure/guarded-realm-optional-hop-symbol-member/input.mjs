// A guarded realm alias read through an OPTIONAL hop the chain CONTINUES past spells the short-circuit ONCE over the whole
// continuation: the member-level conditional cannot carry the `?.` to the hops above it, so the guard hoists and the raw branch is
// spelled plain.
export function symbolMember(flag) {
  if (flag) { var realm = globalThis; }
  return realm?.Symbol.iterator;
}
