import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a value WRITTEN into a reassigned alias resolves in the frame the write stands in, never the read's:
// a `var` the writing function reassigns, a `var` hoisted out of a nested block - read directly or
// through a hop - and a name a parameter default writes past a later `var` of the same name each
// name what the write stored
let viaVar = Set;
function writesVar() {
  var held = Set;
  held = Array;
  viaVar = held;
}
writesVar();
viaVar.from(list);
let viaBlock = Set;
function writesBlock() {
  {
    var realm = globalThis;
  }
  viaBlock = realm.Array;
}
writesBlock();
viaBlock.of(1);
let viaHop = Set;
function writesHop() {
  if (on) {
    var hop = Set;
    hop = Array;
  }
  viaHop = hop;
}
writesHop();
use(() => viaHop.fromAsync(list));
let source = Promise;
let viaDefault = Set;
function writesDefault(x = viaDefault = source) {
  var source = Map;
  return x;
}
writesDefault();
viaDefault.try(fn);