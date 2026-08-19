// an INSTANCE dispatch memoizes its receiver, and when that receiver is a proxy nav carrying the
// environment probe the memo has to hold the COLLAPSED value: spelled raw it reads `.window` off the
// ponyfill and then the next hop off the undefined that answers. the guard root here is not a nav at
// all - its top hop is the CLAIM name - so the collapse plan refused it and the ladder fell to the
// root-substituted spelling, which also dropped the `?.` the source wrote. the keys re-hang INSIDE
// the alternate, where the ponyfill leaf is always defined, which is what the AST emitter spells.
export const memoOverProbe = globalThis.window.self?.Array?.prototype.flat;
export const memoOverProbeCall = globalThis.window.self?.Array?.prototype.flat.call([[1]]);
export const memoTwoKeys = globalThis.window.self?.Array?.prototype.includes;
// the same nav with no instance tail keeps the plain guarded read
export const plainRead = globalThis.window.self?.Array?.prototype;
// NEGATIVE: a SEAL between the keys and the nav ends the chain - the read above it is the source's
// own throw, so the keys stay OUTSIDE the guard
export const sealedKeys = (globalThis.window.self?.Array).prototype?.flat;
// NEGATIVE: no probe under the `?.` - the nav collapses whole and no guard is built
export const noProbe = globalThis.self?.Array?.prototype.flat;
