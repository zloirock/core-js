// Effects in selecting array elements and literal slots stay at their source positions.
// The supported nested at receiver is captured; static-only from patterns remain native.
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
