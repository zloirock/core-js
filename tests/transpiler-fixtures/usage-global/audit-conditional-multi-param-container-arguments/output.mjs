import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The Map key types differ on a required field, so the conditional is false.
// Written argument member maps select string.at without widening the result to an array.
interface Wanted {
  wanted: string;
}
interface Other {
  other: number;
}
type Sel<T> = T extends Map<Other, number> ? number[] : string;
declare const v: Map<Wanted, number>;
declare const r: Sel<typeof v>;
r.at(0);