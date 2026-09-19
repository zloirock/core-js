// a call-rooted fallback LEFT with an SE-bearing computed hop key: the discarded left's effects
// re-emit in SOURCE order ahead of the synth literal - the chain-root call evaluates BEFORE the
// hop key (object before key), interleaved via the rescue channel, not appended last
function f({ from } = (() => (n++, globalThis))()[(eff(), 'self')].Array || Set) { return from; }
function g({ of } = (eff2(), Array) || Set) { return of; }
export const r = [f(), g()];
