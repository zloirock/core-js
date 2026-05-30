// A reassignment positioned AFTER the access does not invalidate the guards that precede it:
// at the access x still holds the guarded value. The outer "string" guard stays and intersects
// the inner `object || string` guard down to string, so .at emits ONLY the string arm. This
// proves the stale-guard drop is scoped to a write BETWEEN the guards, not one after the use.
declare let x: string | number[];
declare function readAny(): string | number[];

if (typeof x === "string") {
  if (typeof x === "object" || typeof x === "string") {
    x.at(0);
  }
  x = readAny();
}
