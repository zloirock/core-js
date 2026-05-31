// a preceding switch (default-returns the non-matching arms) narrows `x`, but a reassignment widens
// it before a later re-narrow that re-admits string. the stale switch guard must be dropped so the
// union is not over-narrowed - the `.at()` polyfill degrades to the generic instance variant.
declare function readAny(): any;
function f(x: string | number[]) {
  switch (typeof x) {
    case "number":
    case "object":
      break;
    default:
      return;
  }
  x = readAny();
  if (typeof x === "object" || typeof x === "string") {
    x.at(0);
  }
}
