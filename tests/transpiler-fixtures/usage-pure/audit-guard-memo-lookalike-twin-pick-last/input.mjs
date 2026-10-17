// A memoized guard root whose source text REPEATS inside its own guarded branch: the second occurrence is a look-alike twin, not
// the root, and only its source position tells them apart.
export function pickLast(fn, o) {
  return o.items?.at(o.items.findLastIndex(fn));
}
