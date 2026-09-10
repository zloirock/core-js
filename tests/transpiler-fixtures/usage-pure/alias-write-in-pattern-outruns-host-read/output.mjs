import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a destructuring host evaluates its whole right-hand side before any slot of its pattern, so a
// read in that right-hand side runs before an alias write a slot default holds - native throws.
// the write's span again ends before the read textually, so the offset gate admitted a narrow
// that erased it: the host read keeps the runtime ctor guard, a read after the host still narrows
let P;
const [q = (P = _Promise, 1)] = [(P === _Promise ? _Promise$try : P.try.bind(P))(() => 1)];
export const after = _Promise$try(() => 2);
export const r = q;