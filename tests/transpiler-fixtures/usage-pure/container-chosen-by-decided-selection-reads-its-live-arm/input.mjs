// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const aliased = typeof Symbol != 'undefined' ? { C: Map } : { C: Object };
export const viaAlias = () => aliased.C.groupBy([1], x => x);
const inSlot = { C: typeof Symbol != 'undefined' ? Iterator : Object };
export const viaSlot = () => inSlot.C.from([1]);
const nested = { inner: typeof Symbol != 'undefined' ? { C: Promise } : { C: Object } };
export const viaNested = () => nested.inner.C.withResolvers();
export const inPlace = () => (typeof Symbol != 'undefined' ? { C: Array } : { C: Object }).C.fromAsync([]);
const { C: { getOwnPropertyDescriptor } } = typeof Symbol != 'undefined' ? { C: Reflect } : { C: Object };
export const viaPattern = () => getOwnPropertyDescriptor({ a: 1 }, 'a');
