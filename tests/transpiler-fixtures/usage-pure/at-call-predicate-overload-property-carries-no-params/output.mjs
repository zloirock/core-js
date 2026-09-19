import _at from "@core-js/pure/actual/instance/at";
// An intersection whose two halves spell `isStr` as a METHOD and as a PROPERTY: the property half
// is a signature with no parameter list at all, and overload discrimination is asked to rank it
// against the method. A ranking that dereferenced the missing list would throw before any
// injection, so the whole file is the assertion - the ranking survives the missing list, `v` stays
// unnarrowed, and the read takes the receiver-generic `instance/at` entry. Dropping the property
// half narrows it to `string/instance/at`, so the entry name is what shows the verdict.
interface P {
  isStr: string;
}
interface M {
  isStr(v: unknown): v is string;
}
declare const o: P & M;
export function f(v: unknown) {
  if (o.isStr(v)) return _at(v).call(v, 0);
  return null;
}