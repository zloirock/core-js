// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
{
for (const [{ values }, { at }] of [[Object, [1]]]) [values, at];
}
