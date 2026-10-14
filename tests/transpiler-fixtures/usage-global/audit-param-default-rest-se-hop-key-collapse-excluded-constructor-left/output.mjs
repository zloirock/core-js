import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A rest parameter default over a realm read behind an effectful hop key, `||` a fallback: excluding the
// left's constructor (`Map`) only stops injecting it - the data subset carries it, so usage-global counts
// the left present and the right (`Set`) never runs, loading nothing, while `groupBy` keeps its own module.
let eff = 0;
function k({
  groupBy,
  ...rest
} = globalThis[eff++, 'self'].Map || Set) {
  return [groupBy, rest];
}
k();