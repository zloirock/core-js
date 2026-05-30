import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A reassignment positioned BEFORE the outer guard does not make that guard stale: the
// guard re-narrows x AFTER the write, so it still holds at the access. The outer "string"
// guard stays and intersects the inner `object || string` guard down to string, so .at
// emits ONLY the string arm. Dropping the outer guard here would unsoundly widen to both arms.
declare let x: string | number[];
declare function readAny(): string | number[];
x = readAny();
if (typeof x === "string") {
  if (typeof x === "object" || typeof x === "string") {
    _atMaybeString(x).call(x, 0);
  }
}