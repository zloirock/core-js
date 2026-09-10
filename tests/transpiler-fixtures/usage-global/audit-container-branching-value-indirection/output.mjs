import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// the branching container value is read through the CANONICAL peel and answered by the canonical
// branch enumeration, so the indirections the bare-alias axis already sees through are seen through
// here too: a wrapped branching value, an arm that aliases another one, and arms whose walks pass
// the same hop name. each line picks a static only one arm carries; distinct method per line.
const c = Math.random() > 0.5;

// a sequence wrapper does not hide the branching value
const wrapped = {
  Base: (0, c ? Object : Array)
};
export const viaSequence = wrapped.Base.fromAsync([]);

// neither does a zero-arg factory call
const factory = {
  Base: (() => c ? Object : Promise)()
};
export const viaFactory = factory.Base.withResolvers();

// an ARM that aliases another branching value reaches that one's arms too
const innerBranch = c ? Object : Map;
const aliasedArm = {
  Base: c ? innerBranch : Boolean
};
export const viaAliasedArm = aliasedArm.Base.groupBy([], x => x);

// arms whose container walks pass the SAME hop name each get their own answer
const hop = {
  left: String,
  right: Reflect
};
const shared = c ? {
  Base: hop.left
} : {
  Base: hop.right
};
export const viaSharedHop = shared.Base.raw`x` + shared.Base.ownKeys({});

// NEGATIVE: an array slot holding a NAV is no branching value - the walk still declines it, so the
// key brings in no static of its own and only the realm the nav names is injected
const navSlot = [globalThis.Array];
export const viaNavSlot = navSlot[0].of(1);