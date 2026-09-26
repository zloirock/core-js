import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a nested parameter pattern whose default is a class reads the class's static slot the way it
// reads a literal's
class K {
  static M = Map;
}
const o = {
  P: Promise
};
export function viaClass({
  M: {
    groupBy
  }
} = K) {
  return groupBy;
}
export function viaLiteral({
  P: {
    try: attempt
  }
} = o) {
  return attempt;
}