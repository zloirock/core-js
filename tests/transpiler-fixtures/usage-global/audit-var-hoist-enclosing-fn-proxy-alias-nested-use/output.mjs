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
// a `var` proxy-global alias hoisted to an ENCLOSING function, dereferenced from a NESTED function.
// the climbing var-hoist fallback surfaces the binding so its `globalThis` init resolves and the
// `g.Map.groupBy` proxy-chain injects the Map statics (plus the global-this polyfill the init needs)
function outer(cond) {
  if (cond) {
    var g = globalThis;
  }
  function inner() {
    return g.Map.groupBy([], () => 1);
  }
  return inner;
}
outer(true);