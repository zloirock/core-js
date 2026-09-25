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
// a `var` bound by a for-of head is the element on every pass and after the loop, even where it
// hoists out of a nested block: a static read off it is guarded on that element in pure and injected
// in usage-global, the same on both parsers
for (var M of [Map]) {}
M.groupBy(src, fn);
function inner() {
  if (flag) {
    for (var P of [Promise]) {}
  }
  return P.try(fn);
}