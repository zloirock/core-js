// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const [, { from }] = [Set, Array];
const arr = from([1, 2, 3]);
arr.at(0);
