// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let from, rest, other;
[{ from, ...rest }] = [Array];
from([1]);
rest;
[{ of: from, ...rest }, other] = [Array, 1];
from(2);
