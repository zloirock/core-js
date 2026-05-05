import _Map from "@core-js/pure/actual/map/constructor";
// chain-assignment carrying a conditional fallback expression: the chain-assign LHS
// (`b = ...`) carries the receiver value that is in turn a conditional. peelFallbackReceiver
// alternates chain-assign + paren peels and reaches the inner ConditionalExpression so each
// branch independently classifies. distinct methods isolate per-key dispatch
const {
  from
} = b = cond ? Array : _Map;
from([1]);
const {
  entries
} = c = cond ? Object : _Map;
entries({
  a: 1
});