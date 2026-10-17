// The iterator slot stays native beside rest. The static sibling retains its polyfill
// and its rest exclusion.
const [{ [Symbol.iterator]: it, of: o, ...r }] = [Array];
it;
o(1);
r;
