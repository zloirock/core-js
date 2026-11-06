const log = [];
function mark(t, v) { log.push(t); return v; }
{
const viaIife = (({ at }, x) => [at.call([8, 9], -1), x])(...[mark('e', [0]), mark('f', 1)]);
}
