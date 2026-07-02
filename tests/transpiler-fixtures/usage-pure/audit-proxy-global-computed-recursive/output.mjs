import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// proxy-global access through doubly-computed keys: `globalThis['globalThis']['Map']`.
// the global-proxy walk must fold every link's key (computed string OR template) so
// the leaf constructor name resolves and rewrites to its polyfill
const m = new _Map();
// also probe template-literal leaf key over a deep proxy chain
const p = new _Promise();
export { m, p };