import _Map from "@core-js/pure/actual/map/constructor";
import _Math$clz32 from "@core-js/pure/actual/math/clz32";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
// Branching container slots do not prove a single static receiver; their reads stay native.
// Constructor arms can still receive pure entries. A bare selecting alias can instead
// guard its named static against the captured constructor. Each row names a distinct method.
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

// A bare alias exposes constructor candidates for an identity guard.
const aliasBase = c ? Object : Math;
export const viaBareAlias = (aliasBase === Math ? _Math$clz32 : aliasBase.clz32.bind(aliasBase))(1);