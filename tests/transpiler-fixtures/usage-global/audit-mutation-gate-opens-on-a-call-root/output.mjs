import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a write ROOTED AT A CALL: the cheap walk decides whether a callee can be followed, but it never
// inlines what the call returns, so it can rule nothing out - the gate OPENS and every name in the
// file is treated as written. the two reads below carry no write of their own and are deopted all
// the same, which is what an open gate means and why a file that has one cannot host a row about
// which root the walk followed
const xs = [];
function realm() {
  return globalThis;
}
realm().Map.groupBy = patch;
Array.from(xs).at(0);
Map.groupBy(xs, it => it);