// Proxy receiver hops collapse to a pure realm value while retaining their own effects.
// Receiver effects precede the computed iterator-key effects and run once.
// Optional lookup guards its key effects; sealed receiver prefixes still run once.

// A non-optional hop effect runs before the iterator-key effect.
const a = globalThis[(hop(), 'self')][(key(), Symbol.iterator)]();

// Without iterator-key effects, the receiver owns its hop effect inline.
const b = globalThis[(probe(), 'self')][Symbol.iterator]();

// A sealed optional lookup guards the key effect before unconditional consumption.
const c = (globalThis?.[(mark(), 'self')][(tag(), Symbol.iterator)])();

// A mid-chain optional receiver runs its hop effect before the iterator key.
const d = globalThis?.[(hop2(), 'self')].window[(key2(), Symbol.iterator)]();
const e = globalThis?.[(hop3(), 'self')].window.self[(key3(), Symbol.iterator)]();

// Parentheses seal the receiver's optional chain; its prefix and hop effect run before the key.
const f = (globalThis?.[(hop4(), 'self')]).window[(key4(), Symbol.iterator)]();
const g = (eff5(), globalThis?.[(hop5(), 'self')]).window[(key5(), Symbol.iterator)]();
