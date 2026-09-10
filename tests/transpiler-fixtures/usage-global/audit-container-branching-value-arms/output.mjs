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
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.clz32";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// a BRANCHING container value reaches EVERY arm: the container walk enumerates the arms of a
// ternary or a logical exactly as the bare-alias axis already does, so a hop spelling answers
// what the alias spelling answers at the same reachability. each line picks a static only ONE
// arm carries, so its import can only come from the enumerated arm; distinct method per line.
const c = Math.random() > 0.5;

// branching IN the slot
const inSlot = {
  Base: c ? Object : Array
};
export const viaSlot = inSlot.Base.fromAsync([]);

// branching OVER the container
const overContainer = c ? {
  Base: Object
} : {
  Base: Promise
};
export const viaContainer = overContainer.Base.withResolvers();

// branching between container ALIASES
const nsLeft = {
  Base: Object
};
const nsRight = {
  Base: Map
};
const aliasBranch = c ? nsLeft : nsRight;
export const viaAlias = aliasBranch.Base.groupBy([], x => x);

// an ARRAY slot indexes a branching value like a keyed one does
const inElement = [c ? String : Object, 0];
export const viaElement = inElement[0].raw`x`;

// a NESTED container descends to the branching slot and fans there
const nested = {
  inner: {
    Base: c ? Object : Reflect
  }
};
export const viaNested = nested.inner.Base.ownKeys({});

// a LOGICAL fallback is the same reachability, and the fan is recursive over nested arms
const logical = {
  Base: c && Object || (c ? Math : Object)
};
export const viaLogical = logical.Base.clz32(1);

// NEGATIVE: arms that carry no such static inject nothing for the key. the arms are a pair no other
// line names, or the family a neighbour already pulled would answer for this one and the row would
// measure nothing: the control is that `isInteger` here DOES add its module
const noStatic = {
  Base: c ? Number : Boolean
};
export const viaNoStatic = noStatic.Base.notAStatic;

// NEGATIVE: arms that name no constructor at all contribute no candidate
const local = {
  of: 1
};
const notCtor = {
  Base: c ? local : 42
};
export const viaNotCtor = notCtor.Base.of(1);