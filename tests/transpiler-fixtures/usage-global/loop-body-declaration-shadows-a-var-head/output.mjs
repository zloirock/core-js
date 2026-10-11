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
// a loop body's lexical declaration shadows a `var` head too: a read in the body takes the body's value,
// never an element the head iterates - while a body `var` declares no binding of its own but writes the
// head's, so a read there is the head's binding and takes every family its member has. the loops bring the
// iteration modules and each element its family; distinct member per line
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