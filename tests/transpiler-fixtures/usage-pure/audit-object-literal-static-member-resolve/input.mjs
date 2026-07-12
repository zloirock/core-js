// an object literal is a name-indexable static container: a nested destructure off one of its keys
// resolves the LAST matching member's value, through the same canonical resolver a class body uses

// a computed static-string key overrides an earlier plain key (last-wins sees through it)
const withComputed = { N: Array, ["N"]: Promise };
const { N: { allSettled } } = withComputed;
export const viaComputed = allSettled([]);

// an unresolvable computed key could BE the target at runtime -> bail (native)
export function dynamicBails(o) {
  const ns = { P: Array, [o.k]: Iterator };
  const { P: { from } } = ns;
  return from([1, 2]);
}

// a trailing spread could redefine the key -> bail (native)
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
