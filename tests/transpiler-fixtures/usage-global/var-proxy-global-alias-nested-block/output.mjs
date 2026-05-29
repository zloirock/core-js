import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `var` alias of a proxy-global declared in a nested non-function block hoists to the
// enclosing function scope, so a static call through it must still resolve and inject
function run(flag) {
  if (flag) {
    var g = globalThis;
  }
  return g.Map.groupBy([], () => 1);
}
run(true);