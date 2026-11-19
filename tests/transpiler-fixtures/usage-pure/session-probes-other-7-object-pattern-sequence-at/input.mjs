const log = [];
const obj = {};
function mark(t, v) { log.push(t); return v; }
{
const { at: m, z } = (mark(), obj); use(m, z);
}
