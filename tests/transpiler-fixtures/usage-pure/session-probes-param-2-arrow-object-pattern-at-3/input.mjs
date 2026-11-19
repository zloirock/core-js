const log = [];
function mark(t, v) { log.push(t); return v; }
{
const v = (({ at }) => at)(mark('e', [0]));
}
