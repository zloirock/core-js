require("core-js/modules/es.symbol.constructor");
require("core-js/modules/es.symbol.description");
require("core-js/modules/es.symbol.async-dispose");
require("core-js/modules/es.symbol.async-iterator");
require("core-js/modules/es.symbol.dispose");
require("core-js/modules/es.symbol.for");
require("core-js/modules/es.symbol.has-instance");
require("core-js/modules/es.symbol.is-concat-spreadable");
require("core-js/modules/es.symbol.iterator");
require("core-js/modules/es.symbol.key-for");
require("core-js/modules/es.symbol.match");
require("core-js/modules/es.symbol.match-all");
require("core-js/modules/es.symbol.replace");
require("core-js/modules/es.symbol.search");
require("core-js/modules/es.symbol.species");
require("core-js/modules/es.symbol.split");
require("core-js/modules/es.symbol.to-primitive");
require("core-js/modules/es.symbol.to-string-tag");
require("core-js/modules/es.symbol.unscopables");
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.reflect.own-keys");
require("core-js/modules/es.aggregate-error.constructor");
require("core-js/modules/es.promise.constructor");
require("core-js/modules/es.promise.catch");
require("core-js/modules/es.promise.finally");
require("core-js/modules/es.promise.reject");
require("core-js/modules/es.promise.resolve");
require("core-js/modules/es.promise.all");
require("core-js/modules/es.promise.all-settled");
require("core-js/modules/es.promise.any");
require("core-js/modules/es.promise.race");
require("core-js/modules/es.promise.try");
require("core-js/modules/es.promise.with-resolvers");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.async-iterator.async-dispose");
require("core-js/modules/es.array.species");
require("core-js/modules/es.array-buffer.species");
require("core-js/modules/es.date.to-primitive");
require("core-js/modules/es.function.has-instance");
require("core-js/modules/es.iterator.constructor");
require("core-js/modules/es.iterator.chunks");
require("core-js/modules/es.iterator.concat");
require("core-js/modules/es.iterator.dispose");
require("core-js/modules/es.iterator.drop");
require("core-js/modules/es.iterator.every");
require("core-js/modules/es.iterator.filter");
require("core-js/modules/es.iterator.find");
require("core-js/modules/es.iterator.flat-map");
require("core-js/modules/es.iterator.for-each");
require("core-js/modules/es.iterator.from");
require("core-js/modules/es.iterator.includes");
require("core-js/modules/es.iterator.join");
require("core-js/modules/es.iterator.map");
require("core-js/modules/es.iterator.reduce");
require("core-js/modules/es.iterator.some");
require("core-js/modules/es.iterator.take");
require("core-js/modules/es.iterator.to-array");
require("core-js/modules/es.iterator.windows");
require("core-js/modules/es.iterator.zip");
require("core-js/modules/es.iterator.zip-keyed");
require("core-js/modules/es.json.to-string-tag");
require("core-js/modules/es.map.constructor");
require("core-js/modules/es.map.species");
require("core-js/modules/es.map.group-by");
require("core-js/modules/es.map.get-or-insert");
require("core-js/modules/es.map.get-or-insert-computed");
require("core-js/modules/es.math.to-string-tag");
require("core-js/modules/es.regexp.species");
require("core-js/modules/es.set.constructor");
require("core-js/modules/es.set.species");
require("core-js/modules/es.set.difference");
require("core-js/modules/es.set.intersection");
require("core-js/modules/es.set.is-disjoint-from");
require("core-js/modules/es.set.is-subset-of");
require("core-js/modules/es.set.is-superset-of");
require("core-js/modules/es.set.symmetric-difference");
require("core-js/modules/es.set.union");
require("core-js/modules/es.string.iterator");
require("core-js/modules/es.typed-array.species");
require("core-js/modules/es.weak-map.constructor");
require("core-js/modules/es.weak-map.get-or-insert");
require("core-js/modules/es.weak-map.get-or-insert-computed");
require("core-js/modules/esnext.promise.all-keyed");
require("core-js/modules/esnext.promise.all-settled-keyed");
require("core-js/modules/web.dom-collections.iterator");
require("core-js/modules/web.self");
// a sloppy script spelling no CommonJS may run bare, its top level the realm itself: a top-level `var` or function
// declaration is then the global object's own slot. what it holds leaves the file as an undeclared name's value
// does, and a constructor it holds loads its whole static family, whether the `var` is initialized with it, written
// later, spelled in a block or bound by a pattern, or a function returns it. a `var` inside a function stays its own
var Promise = self.Promise;
var M;
M = Map;
if (self.flag) {
  var S = Set;
}
var {
  Symbol: Y
} = self;
function iteratorCtor() {
  return Iterator;
}
function local() {
  var W = WeakMap;
  return new W();
}
local();