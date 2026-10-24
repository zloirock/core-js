// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
function mark(t, v) { log.push(t); return v; }
{
const [{ from: f }] = [(mark++, pick ? Array : userObj)];
}
{
const [{ from: f }] = [pick ? (mark++, Array) : userObj];
}
{
const [{ w: { at: m } }] = [{ w: (mark(), arr) }]; use(m);
}
