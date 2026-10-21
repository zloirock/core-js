// Iterator consumption retains receiver and symbol-key order, optional lookup and sealed-call throws.
// Effectful realm keys remain in the receiver access.
const a = globalThis[(hop(), 'self')][(key(), Symbol.iterator)]();

const b = globalThis[(probe(), 'self')][Symbol.iterator]();

const c = (globalThis?.[(mark(), 'self')][(tag(), Symbol.iterator)])();

const d = globalThis?.[(hop2(), 'self')].window[(key2(), Symbol.iterator)]();
const e = globalThis?.[(hop3(), 'self')].window.self[(key3(), Symbol.iterator)]();

const f = (globalThis?.[(hop4(), 'self')]).window[(key4(), Symbol.iterator)]();
const g = (eff5(), globalThis?.[(hop5(), 'self')]).window[(key5(), Symbol.iterator)]();
