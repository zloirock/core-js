// NEGATIVE: a non-proxy call root keeps the whole chain native off the ref
const h = () => ({ window: { Array: { of: x => [x, 'custom'] } } });
export const nonProxyStaysRaw = h()?.window?.Array.of(8).at(0);
