import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// unwrapInitValue alternates ParenthesizedExpression peel and SequenceExpression tail
// peel until stable. used to reach the semantic init through any mix of paren wraps and
// SE-prefix layers. distinct methods (.from / .of / .fromAsync) per line surface the
// resolved global per-receiver
(((sideEffect(), Array)));
const from = _Array$from;
const of = _Array$of;
(sideEffect(), (0, Array));
const fromAsync = _Array$fromAsync;
export const a = from([1]);
export const b = of(2, 3);
export const c = fromAsync([_Promise$resolve(1)]);