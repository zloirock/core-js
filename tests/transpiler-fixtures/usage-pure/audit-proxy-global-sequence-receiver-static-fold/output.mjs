import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// proxy-global in a sequence receiver ahead of a receiver-dropping static fold. line one keeps a
// side-effecting prefix and folds the tail proxy-chain (`(eff(), globalThis.Array).from` ->
// `(eff(), _Array$from)`): the tail globalThis is marked subsumed so it does not queue a parallel
// substitution overlapping the eliminated receiver range - that crashed the text-transform compose.
// line two drops a pure non-tail proxy operand entirely (`(globalThis.foo, Promise).resolve`):
// no leftover global, no crash. distinct statics so each line's collapse is independent
const a = (eff(), _Array$from)([1]);
const b = _Promise$resolve(2);
a;
b;