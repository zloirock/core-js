import _at from "@core-js/pure/actual/instance/at";
// A reassignment between an outer guard and an inner fresh re-narrowing conditional
// makes the outer guard stale. The inner `object || string` guard narrows x to its full
// union (string | number[]) at the access, so .at must emit BOTH array and string arms;
// intersecting against the stale outer "string" guard would unsoundly drop the array arm.
declare let x: string | number[];
declare function readAny(): string | number[];
if (typeof x === "string") {
  x = readAny();
  if (typeof x === "object" || typeof x === "string") {
    _at(x).call(x, 0);
  }
}