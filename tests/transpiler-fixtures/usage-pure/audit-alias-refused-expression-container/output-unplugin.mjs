import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// a ctor-alias write nested in an EXPRESSION CONTAINER (a conditional branch, a logical
// short-circuit, an expression-body arrow) runs on one path / an unknown call, so the
// static narrow is refused and the member read gets the RUNTIME ctor guard - the value swap
// still lands wherever the native write would, so the imports stay live (no dead guard)
let M;
Math.random() > 2 ? ({ Map: M } = _globalThis) : 0;
export const viaTernary = (M === _Map ? _Map$groupBy : M.groupBy.bind(M))([1, 2], x => x);

let S;
Math.random() > 2 && ({ Set: S } = _globalThis);
export const viaLogical = S.difference(new _Set());

let P;
const assign = () => ({ Promise: P } = _globalThis);
assign();
export const viaArrowBody = (P === _Promise ? _Promise$try : P.try.bind(P))(() => 1);

// an UNCONDITIONAL statement-level write stays trusted and the read folds DIRECTLY (no guard)
// - the boundary that separates a refused container from a passing one
let A;
({ Array: A } = _globalThis);
export const viaStatement = _Array$from([1, 2, 3]);