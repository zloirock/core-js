// a chain-assign whose VALUE is an inline CALL resolving to a proxy-global (`(w = f())?.self.X`,
// `f = () => globalThis`): the assign RESULT is as always-defined as a bare `globalThis` once substituted, so
// the `?.` is DEAD and erases in step with the receiver collapse (`resolveObjectName` inlines the callee) -
// a kept guard would leave babel a raw static and unplugin a re-run of the call in the fold. distinct method.
let w;
const f = () => globalThis;
export const staticCall = (w = f())?.self.Array.of(1, 2);
export const instanceTail = (w = f())?.self.Array.from([3]).at(0);
export const proto = (w = f())?.self.Set.prototype.has.call(new Set([1]), 1);
