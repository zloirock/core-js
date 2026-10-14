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
// A rest parameter default selecting between two realm reads through a redundant `.self` hop: excluding the
// left's constructor (`Map`) only stops injecting it - the data subset carries it, so usage-global counts the
// left present and the right (`globalThis.self.Set`) never runs, loading nothing; `groupBy` keeps its module.
function g({
  groupBy,
  ...rest
} = globalThis.self.Map || globalThis.self.Set) {
  return groupBy([], x => x);
}
g();