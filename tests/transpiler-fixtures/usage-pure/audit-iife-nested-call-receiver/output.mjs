import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise from "@core-js/pure/actual/promise/constructor";
// inline-call resolution must bail when the receiver hides behind nested calls. covers:
// 1) double-IIFE `(() => () => Promise)()` - outer body is an arrow, not a receiver, no polyfill;
// 2) single-IIFE `(() => Promise).call(null)` - control case, polyfill emits;
// 3) chained inline aliases `outer = () => inner()` - resolution walks one hop, bails on the second
const out1 = (() => () => _Promise)().resolve(1);
const out2 = (() => _Promise).call(null).reject(2);
const inner = () => _Promise;
const outer = () => inner();
const out3 = _Promise$all([1]);
export { out1, out2, out3 };