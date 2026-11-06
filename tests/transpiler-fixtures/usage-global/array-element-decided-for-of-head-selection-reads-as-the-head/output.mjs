import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an array element holding a `||` / `??` whose left is a for-of head over built-ins, the right dead, is
// read as the head spelled alone: a static a sibling element sits beside is extracted as the head's - the
// element's own read lacks it on an old engine - and a sole element's re-read reuses the head's name
for (const M of [Map]) {
  const [{
    groupBy
  }, count] = [M || Object, 1];
  use(groupBy, count);
}
for (const P of [Promise]) {
  const [{
    try: attempt
  }] = [P ?? Object];
  use(attempt);
}