// inline-call resolution must bail when the receiver hides behind nested calls. covers:
//   1) double-IIFE `(() => () => Promise)()` - outer body is itself an arrow, not a
//      resolvable receiver, so `.resolve` must NOT polyfill
//   2) single-IIFE `(() => Promise).call(null)` - control case, polyfill emits
//   3) chained inline aliases `outer = () => inner()` - resolution walks only ONE
//      hop, must bail on the second nesting
const out1 = (() => () => Promise)().resolve(1);
const out2 = (() => Promise).call(null).reject(2);
const inner = () => Promise;
const outer = () => inner();
const out3 = outer().all([1]);
export { out1, out2, out3 };
