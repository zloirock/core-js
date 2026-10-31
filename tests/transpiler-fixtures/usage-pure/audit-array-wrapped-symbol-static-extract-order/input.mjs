// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
const [{ [Symbol.iterator]: it, of: o, ...r }] = [Array];
it;
o(1);
r;
