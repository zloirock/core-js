import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A lexical loop-body declaration shadows its var head; its read cannot widen the head's constructor.
// A body var writes the head binding instead and shares its possible receiver families.
// Distinct methods keep each loop's injection observable.
for (var M of [Map]) {
  let M = pick();
  use(M.groupBy);
}
for (var s of ['abc']) {
  let s = [1];
  use(s.at(-1));
}
for (var t of ['abc']) {
  var t = [1];
  use(t.includes(1));
}