const log = [];
function mark(t, v) { log.push(t); return v; }
{
const { w: { at: m } } = { w: (mark(), [1, 2]) }; use(m);
}
