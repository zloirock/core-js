// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
for (const [{ of, ...r }] = [Array]; ; ) {
  of(1);
  break;
}
for (const [{ from }, extra] = [Array, 1]; ; ) {
  from([2, extra]);
  break;
}
for (let i = 0, [{ fromAsync, ...more }] = [Array]; i < 1; i++) {
  fromAsync([i]);
}
