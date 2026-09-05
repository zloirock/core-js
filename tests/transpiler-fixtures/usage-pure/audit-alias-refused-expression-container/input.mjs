// a ctor-alias write nested in an EXPRESSION CONTAINER (a conditional branch, a logical
// short-circuit, an expression-body arrow) runs on one path / an unknown call, so the
// static narrow is refused and the member read gets the RUNTIME ctor guard - the value swap
// still lands wherever the native write would, so the imports stay live (no dead guard)
let M;
Math.random() > 2 ? ({ Map: M } = globalThis) : 0;
export const viaTernary = M.groupBy([1, 2], x => x);

let S;
Math.random() > 2 && ({ Set: S } = globalThis);
export const viaLogical = S.difference(new Set());

let P;
const assign = () => ({ Promise: P } = globalThis);
assign();
export const viaArrowBody = P.try(() => 1);

// an UNCONDITIONAL statement-level write stays trusted and the read folds DIRECTLY (no guard)
// - the boundary that separates a refused container from a passing one
let A;
({ Array: A } = globalThis);
export const viaStatement = A.from([1, 2, 3]);
