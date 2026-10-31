import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `var name = X` re-declaration writes X exactly as `name = X` would, so the value channels read
// it: the last declaration reaches the use and its init decides the static - the computed key and
// the receiver alike. a re-declaration inside a NESTED block reaches the use through the positional
// redeclaration walk, which reads its init in the declarator's own scope. one global per row, so a
// row that stops flowing its init loses its own module
export function keyed() {
  var K = 'from';
  var K = 'of';
  return Array[K](1, 2);
}
export function receiver(list, fn) {
  var C = Object;
  var C = globalThis.Map;
  return C.groupBy(list, fn);
}
export function nested(list) {
  var N = 'entries';
  {
    var N = 'fromEntries';
  }
  return Object[N](list);
}