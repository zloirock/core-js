import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// usage-global bias: a nested-block `var` aliasing a real global must still inject its
// polyfill modules even when an OUTER same-name binding (here a function declaration) masks
// it in the scope tracker - the closest-binding resolution reports the nested declarator, so
// the alias branch resolves `G.from` to Array.from (under-inject would break ie:11 when the
// conditional path runs)
function G() {}
export function f(cond) {
  if (cond) {
    var G = Array;
  }
  return G.from([1]);
}