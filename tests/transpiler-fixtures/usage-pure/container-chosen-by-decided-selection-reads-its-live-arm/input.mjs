// Decided selections expose their live container to later member analysis.
// Direct member statics remain served while nested destructuring retains native slot reads.
const aliased = typeof Symbol != 'undefined' ? { C: Map } : { C: Object };
export const viaAlias = () => aliased.C.groupBy([1], x => x);
const inSlot = { C: typeof Symbol != 'undefined' ? Iterator : Object };
export const viaSlot = () => inSlot.C.from([1]);
const nested = { inner: typeof Symbol != 'undefined' ? { C: Promise } : { C: Object } };
export const viaNested = () => nested.inner.C.withResolvers();
export const inPlace = () => (typeof Symbol != 'undefined' ? { C: Array } : { C: Object }).C.fromAsync([]);
const { C: { getOwnPropertyDescriptor } } = typeof Symbol != 'undefined' ? { C: Reflect } : { C: Object };
export const viaPattern = () => getOwnPropertyDescriptor({ a: 1 }, 'a');
