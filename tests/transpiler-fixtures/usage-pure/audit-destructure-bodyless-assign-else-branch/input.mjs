// IfStatement.alternate slot: same block-wrap behaviour as the consequent slot. the
// SE-prefixed static-value receiver lives in the `else` body; the wrap keeps the SE
// conditional on `!cond` rather than leaking to module scope.
let from;
if (cond) noop();
else ({ from } = (sideEffect(), Array));
