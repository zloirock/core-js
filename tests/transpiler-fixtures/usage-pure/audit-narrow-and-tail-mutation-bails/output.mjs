import _includes from "@core-js/pure/actual/instance/includes";
// mutation in the conditional's test-tail after the typeof guard but BEFORE the consequent
// evaluates - `&& (x = [...], true)` reassigns x between the check and the use. narrow must
// drop or the polyfill picks string-only Maybe-fallback that TypeErrors on the Array runtime
let x: string | number[] = "hi";
if (typeof x === "string" && (x = [1, 2, 3], true)) {
  _includes(x).call(x, 1);
}