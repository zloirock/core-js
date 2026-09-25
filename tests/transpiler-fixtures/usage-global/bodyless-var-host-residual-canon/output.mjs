import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a bodyless `var` destructure hosts its claims in the slot on the shared residual canon: extractions
// lead a residual whose init runs no code and follow one whose init does, its prefix staying in it;
// an emptied pattern keeps what its init runs - a getter read replayed whole, a realm call alone, a
// read off an effectful sequence root whole - ahead of the binding. a ref any of them mints is
// declared where the slot's owner stands, never in a block the slot was given
class Src {
  static get realm() {
    log();
    return globalThis;
  }
}
function load() {
  log();
  return globalThis;
}
if (c) var {
  allSettled: f1,
  other: o1
} = globalThis.Promise;
if (c) var {
  groupBy: f2,
  other: o2
} = Src.realm.Map;
if (c) var {
  from: f3,
  other: o3
} = (eff(), globalThis.Array);
while (c--) var {
  fromEntries: f4,
  other: o4
} = load().Object;
lbl: var {
  try: f5,
  other: o5
} = (n++, Src.realm.Promise);
if (c) var {
  withResolvers: f6
} = Src.realm.Promise;
if (c) var {
  sumPrecise: f7
} = (eff(), load()).Math;
if (c) var {
  of: f8
} = (eff(), globalThis).Array;