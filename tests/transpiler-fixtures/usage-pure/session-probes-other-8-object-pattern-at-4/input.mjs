const arr = [1, 2];
const log = [];
function mark(t, v) { log.push(t); return v; }
{
const { w: { at: m } } = { w: (mark(), arr) }; use(m);
}
{
const { w: { at: m }, z } = { z: tick('z', 1), w: tick('w', arr) }; use(m, z);
}
