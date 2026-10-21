// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let calls = 0;
let a;
const [{
  from
}] = [a = (() => {
  calls++;
  return Array;
})()];