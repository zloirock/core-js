// A named object-literal slot resolves its last matching value.
// Unknown computed keys and trailing spreads require a constructor identity check;
// replacement values retain their own member, and accessors remain unresolved.
// Constructors used by unresolved reads must carry their static methods.

// a computed static-string key overrides an earlier plain key (last-wins sees through it)
const withComputed = { N: Array, ["N"]: Promise };
const { N: { allSettled } } = withComputed;
export const viaComputed = allSettled([]);

// An unknown computed key may replace the slot; dispatch on the stored constructor.
export function dynamicBails(o) {
  const ns = { P: Array, [o.k]: Iterator };
  const { P: { from } } = ns;
  return from([1, 2]);
}

// A trailing spread may replace the slot; preserve the replacement's own property.
export function spreadBails(extra) {
  const ns = { Q: Map, ...extra };
  const { Q: { groupBy } } = ns;
  return groupBy([], x => x);
}

// a getter winning the key is a dynamic value -> bail (native)
export function accessorBails() {
  const ns = { get R() { return Set; } };
  const { R: { union } } = ns;
  return union;
}

// a clean plain key folds normally (control)
const clean = { S: Iterator };
const { S: { from } } = clean;
export const viaClean = from([3, 4]);
