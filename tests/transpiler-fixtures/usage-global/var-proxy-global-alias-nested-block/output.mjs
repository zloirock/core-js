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
// a `var` proxy-global alias declared in a CONDITIONAL nested block, used OUTSIDE the branch. the
// var-hoist fallback surfaces it (estree-toolkit misses nested-block vars) and usage-global INJECTS
// the Map statics: the call site `g.Map.groupBy` is preserved, so a falsy `flag` throws natively at
// `g.Map` (sound) and a truthy one finds the polyfill present. contrast the usage-pure twin
// audit-conditional-block-var-alias-escapes-branch-bails, which BAILS the same shape because its
// receiver-dropping rewrite (`-> _groupBy`) would mask that native throw - the dominance gate is
// pure-only
function run(flag) {
  if (flag) {
    var g = globalThis;
  }
  return g.Map.groupBy([], () => 1);
}
run(true);