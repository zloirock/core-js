// Branching container slots do not prove a single static receiver. An arm that is a native static
// owner guards the static it names against the captured slot, as a bare selecting alias guards it
// against the captured constructor; an arm pure swaps whole reads its own statics, and one naming
// no such static leaves the read native. Each row names a distinct method.
const c = typeof document == 'undefined';

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
const inElement = [c ? Object : String, 0];
export const viaElement = inElement[0].raw({ raw: ['x'] });

// a NESTED container descends to the branching slot
const nested = { inner: { Base: c ? Object : Reflect } };
export const viaNested = nested.inner.Base.ownKeys({});

// A bare alias exposes constructor candidates for an identity guard.
const aliasBase = c ? Object : Math;
export const viaBareAlias = aliasBase.clz32(1);
