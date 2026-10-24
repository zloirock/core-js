// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let pick = 1;
const userObj = {};
{
let f; [{ from: f }] = [pick ? Array : userObj];
}
