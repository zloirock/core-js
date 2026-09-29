import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A later user write replaces the constructor introduced by the captured assignment.
// The capture still returns its original realm and evaluates each effect once.
const log = [];
function read() {
  let C;
  const realm = {
    [(log.push('key'), 'Map')]: C
  } = (log.push('rhs'), globalThis);
  C = {
    groupBy: 9
  };
  return [realm === globalThis, C.groupBy];
}
export const result = read();
export const effects = log;