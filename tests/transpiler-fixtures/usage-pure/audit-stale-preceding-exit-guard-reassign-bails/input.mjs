// a preceding early-exit guard narrows `x` to string, but a reassignment widens it before a later
// re-narrow that re-admits both branches. the stale early-exit guard must be dropped so the union is
// not over-narrowed back to string - the `.at()` polyfill degrades to the generic instance variant.
declare function readAny(): any;
function f(x: string | number[]) {
  if (typeof x !== "string") return;
  x = readAny();
  if (typeof x === "object" || typeof x === "string") {
    x.at(0);
  }
}
