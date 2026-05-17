// control for the *-tail-mutation-bails family: same shapes WITHOUT mutations should
// keep the narrowing intact and pick the string-specific Maybe-fallback polyfill, not
// the generic one. asserts the fix doesn't regress the happy path by over-bailing
let x: string | number[] = "hi";
if (typeof x === "string" && true) {
  x.includes(1);
}

function probe() {
  let y: string | number[] = "hi";
  if (typeof y !== "string") return;
  y.includes(1);
}
probe();
