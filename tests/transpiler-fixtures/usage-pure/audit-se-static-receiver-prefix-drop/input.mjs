// a static call through a SequenceExpression receiver keeps only the tail: dropped
// effect-free prefix operands (including polyfillable globals) are suppressed WHOLE -
// their own queued rewrites would have no needle left in the emitted text. SE-bearing
// prefix operands re-emit and keep their own polyfills
export const r1 = (Iterator, Array).from(x);
export const r2 = (eff(), Map, Array).of(y);
export const r3 = ((WeakSet, Iterator), Array).isArray(z);
export const r4 = (Iterator.from(seed), Array).from(w);
