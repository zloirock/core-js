// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
const arr = [1, 2];
const nb = {
  y: arr
};
{
  const [{
      from: f
    }] = [...[Array]],
    [{
      z
    }] = [...[nb]];
}