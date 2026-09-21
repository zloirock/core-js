// Branching container slots do not prove a single static receiver; their reads stay native.
// Constructor arms can still receive pure entries. A bare selecting alias can instead
// guard its named static against the captured constructor. Each row names a distinct method.
const c = Math.random() > 0.5;

// branching IN the slot
const inSlot = { Base: c ? Object : Array };
export const viaSlot = inSlot.Base.fromAsync([]);

// branching OVER the container
const overContainer = c ? { Base: Object } : { Base: Promise };
export const viaContainer = overContainer.Base.withResolvers();

// branching between container ALIASES
const nsLeft = { Base: Object };
const nsRight = { Base: Map };
const aliasBranch = c ? nsLeft : nsRight;
export const viaAlias = aliasBranch.Base.groupBy([], x => x);

// an ARRAY slot indexes a branching value like a keyed one does
const inElement = [c ? String : Object, 0];
export const viaElement = inElement[0].raw`x`;

// a NESTED container descends to the branching slot
const nested = { inner: { Base: c ? Object : Reflect } };
export const viaNested = nested.inner.Base.ownKeys({});

// A bare alias exposes constructor candidates for an identity guard.
const aliasBase = c ? Object : Math;
export const viaBareAlias = aliasBase.clz32(1);
