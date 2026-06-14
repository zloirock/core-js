// a side-effect-bearing proxy-global receiver (`(eff(), globalThis.Array)`) for a symbol-iterator +
// static-sibling destructure: the SE prefix is preserved on the memoized receiver, and the sibling static
// still re-polyfills (`from` -> the pure static) - the receiver is peeled to its runtime tail to resolve
// the ctor, so the SE wrapper doesn't hide the proxy-global member
const { [Symbol.iterator]: it, from } = (eff(), globalThis.Array);
it;
from([1]);
export { it, from };
