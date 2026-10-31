import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A call the build polyfills inside the prefix an array wrapper's element buries keeps its own
// substitution while the static beside it is served by a literal in the slot: the prefix stays where
// the source wrote it, ahead of that literal, and runs once.
const seen = [];
const eff = t => (seen.push(t), t);
const w = "abc";
const [{
  Map: {
    groupBy
  }
}] = [(eff(w.at(-1)), globalThis)];
export { groupBy, seen };