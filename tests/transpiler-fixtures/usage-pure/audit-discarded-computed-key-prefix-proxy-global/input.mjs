// A PURE proxy-global (`globalThis` / `Symbol`) buried in a DISCARDED computed-key sequence prefix
// (`x[(globalThis, 'includes')]`) is peeled to the tail key, and the polyfill swap drops the whole `[...]`
// text. the dropped proxy-global must NOT keep a stranded `globalThis -> _globalThis` rewrite queued
// against eliminated source (text emitter would crash composing it). a side-effecting prefix operand
// (`n++`) is instead re-emitted ahead of the result. distinct dispatch + method per line: instance
// drop, static collapse, symbol-iterator, and a mixed side-effect-plus-proxy prefix.
let n = 0;
const arr = [[1]];
const instanceKey = arr[(globalThis, "includes")](1);
const staticKey = Array[(globalThis, "from")]([1, 2]);
const symbolKey = [...arr[(globalThis, Symbol.iterator)]()];
const mixedSe = arr[(n++, globalThis, "at")](0);
export { instanceKey, staticKey, symbolKey, mixedSe, n };
