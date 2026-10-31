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
// a `var` proxy-global alias declared in a CONDITIONAL nested block, used OUTSIDE the branch.
// a var-hoist fallback surfaces it (nested-block vars are otherwise missed) and usage-global
// INJECTS the Map statics: `g.Map.groupBy` is preserved, so a falsy `flag` throws natively at
// `g.Map` and a truthy one finds the polyfill. the usage-pure twin BAILS (its receiver-dropping
// rewrite would mask that native throw); this dominance gate is pure-only.
function run(flag) {
  if (flag) {
    var g = globalThis;
  }
  return g.Map.groupBy([], () => 1);
}
run(true);