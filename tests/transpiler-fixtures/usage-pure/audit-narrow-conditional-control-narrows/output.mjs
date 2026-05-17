import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// control for the *-tail-mutation-bails family: same shapes WITHOUT mutations should
// keep the narrowing intact and pick the string-specific Maybe-fallback polyfill, not
// the generic one. asserts the fix doesn't regress the happy path by over-bailing
let x: string | number[] = "hi";
if (typeof x === "string" && true) {
  _includesMaybeString(x).call(x, 1);
}
function probe() {
  let y: string | number[] = "hi";
  if (typeof y !== "string") return;
  _includesMaybeString(y).call(y, 1);
}
probe();