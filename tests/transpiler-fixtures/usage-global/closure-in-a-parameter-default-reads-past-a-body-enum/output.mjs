import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a closure written in a parameter list runs in that list's environment, so an enum the function's body
// declares does not shadow a name it reads: the closure reads the global or the outer binding
export function grouped(p = () => Map.groupBy(xs, f)) {
  enum Map {
    x
  }
  return [p, Map];
}
const s = 'abc';
export function last(q = () => s.at(-1)) {
  enum s {
    y
  }
  return [q, s];
}