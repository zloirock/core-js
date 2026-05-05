// chain-assignment carrying a conditional fallback expression: the chain-assign LHS
// (`b = ...`) carries the receiver value that is in turn a conditional. peelFallbackReceiver
// alternates chain-assign + paren peels and reaches the inner ConditionalExpression so each
// branch independently classifies. distinct methods isolate per-key dispatch
const { from } = (b = (cond ? Array : Map));
from([1]);
const { entries } = (c = (cond ? Object : Map));
entries({ a: 1 });
