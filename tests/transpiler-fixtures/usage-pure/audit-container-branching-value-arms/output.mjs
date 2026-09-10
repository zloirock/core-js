import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
// the pure twin of the global branching-container union, and its regression guard: the union is a
// usage-global concept - this flavor has to REWRITE the read, and a branching hop names no single
// receiver to rewrite it to - so every static read below stays native. what pure does polyfill is
// the arms themselves, in place, where each constructor is spelled. distinct method per line.
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
  Base: _Promise
};
export const viaContainer = overContainer.Base.withResolvers();

// branching between container ALIASES
const nsLeft = {
  Base: Object
};
const nsRight = {
  Base: _Map
};
const aliasBranch = c ? nsLeft : nsRight;
export const viaAlias = aliasBranch.Base.groupBy([], x => x);

// an ARRAY slot indexes a branching value like a keyed one does
const inElement = [c ? String : Object, 0];
export const viaElement = inElement[0].raw`x`;

// a NESTED container descends to the branching slot
const nested = {
  inner: {
    Base: c ? Object : _Reflect
  }
};
export const viaNested = nested.inner.Base.ownKeys({});

// the bare-alias spelling of the same reachability is declined the same way
const aliasBase = c ? Object : Math;
export const viaBareAlias = aliasBase.clz32(1);