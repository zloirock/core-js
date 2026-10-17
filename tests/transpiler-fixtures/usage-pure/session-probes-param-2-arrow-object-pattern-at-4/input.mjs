const log = [];
function mark(t, v) { log.push(t); return v; }
{
const v = (({ at }, x) => at)(mark('e', [0]), 1);
}
