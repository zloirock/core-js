// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const log = [];
{
const [{ from: f }, { Map: M }] = [pick ? Array : userObj, globalThis]; log.push(f === Array.from, typeof M);
}
