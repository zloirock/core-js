import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// The `Object` box holds every interface alike, so two containers over DIFFERENT ones resolve to
// one shape. Read as identity that agreement fires the TRUE branch tsc answers FALSE, keying an
// array-only `at` to a value the false branch types as a string. Neither branch is knowable here,
// so the generic helper is the answer - `at` reads on both families and shows which one was taken.
interface Wanted {
  wanted: string;
}
interface Other {
  other: number;
}
type Sel<T> = T extends Array<Other> ? number[] : string;
declare const v: Array<Wanted>;
declare const r: Sel<typeof v>;
r.at(0);