// Same method name across different static dispatchers tests nth-occurrence ordering:
// `Array.from`, `Object.fromEntries`, both share `from` substring but distinct callees
const a = Array.from(x);
const b = Object.fromEntries(p);
const c = Array.from(y).at(-1);
