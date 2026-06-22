// A structural type-predicate (`isP(v): v is P`) narrows `v` to P inside the guard - a distinct
// resolution entry from a declared annotation. The overload arg-match must reach this path too, so
// `v.parse(123)` (number) selects the number overload (string return -> String.at -> `_atMaybeString`)
// instead of the declaration-first array overload (`_atMaybeArray` on a string value throws on ie:11)
interface P {
  parse(x: string): string[];
  parse(x: number): string;
}
declare function isP(v: unknown): v is P;
declare const v: unknown;
if (isP(v)) {
  const r = v.parse(123);
  r.at(0);
}
