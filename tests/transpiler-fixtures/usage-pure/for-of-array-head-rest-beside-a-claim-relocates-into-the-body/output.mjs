// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
const pairing = () => [Math, 1];
for (const [{
  imul: viaCallRest
}, ...afterCall] of [pairing()]) use(viaCallRest(2, 3), afterCall);
const pair = [Math, 1];
for (const [{
  cosh: viaAliasRest
}, ...afterAlias] of [pair]) use(viaAliasRest(1), afterAlias);