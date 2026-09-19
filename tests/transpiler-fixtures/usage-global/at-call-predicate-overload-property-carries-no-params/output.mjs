import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An intersection whose two halves spell `isStr` as a METHOD and as a PROPERTY: the property half
// is a signature with no parameter list at all, and overload discrimination is asked to rank it
// against the method. A ranking that dereferenced the missing list would throw before any
// injection, so the whole file is the assertion - the discrimination declines here, `v` stays
// unnarrowed, and BOTH instance families land, exactly as they do with the property half alone.
interface P {
  isStr: string;
}
interface M {
  isStr(v: unknown): v is string;
}
declare const o: P & M;
export function f(v: unknown) {
  if (o.isStr(v)) return v.at(0);
  return null;
}