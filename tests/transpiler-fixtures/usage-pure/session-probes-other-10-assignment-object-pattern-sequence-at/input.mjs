const arr = [1, 2];
const log = [];
function mark(t, v) { log.push(t); return v; }
{
let m; ({ w: { at: m } } = { w: (mark(), arr) }); use(m);
}
