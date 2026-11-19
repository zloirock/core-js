const log = [];
function mark(t, v) { log.push(t); return v; }
{
const { at: m } = (mark(), [1, 2]); use(m);
}
