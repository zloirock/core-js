// Negative: same nested-guard shape as the stale-outer case but with NO reassignment
// between the outer and inner guards. Both guards hold simultaneously, so the outer
// "string" guard must stay and intersect the inner `object || string` guard down to string;
// .at then emits ONLY the string arm. This proves the stale-guard drop is scoped to an
// actual intervening reassignment and does not over-bail every nested guard.
declare let x: string | number[];

if (typeof x === "string") {
  if (typeof x === "object" || typeof x === "string") {
    x.at(0);
  }
}
