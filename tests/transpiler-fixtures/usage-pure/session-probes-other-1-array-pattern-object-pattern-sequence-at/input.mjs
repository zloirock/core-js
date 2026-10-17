const log = [];
function eff() { return Object; }
function mark(t, v) { log.push(t); return v; }
{
const [, { y: { at: ci } }] = [eff(), { y: (mark(), getArr()) }]; use(ci);
}
