// NEGATIVE: a call root yielding an object of the user's own keeps the chain off the memo - the key
// spelled here is theirs, not the global's, and swapping it in would change which function runs
const plain = () => ({ window: { Math: { trunc: x => [x, 'custom'] } } });
export const nonProxyRoot = plain()?.window?.Math.trunc(6.7).at(0);
