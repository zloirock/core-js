// Capture each element once, then evaluate its computed key before the method read.
// The sibling binding keeps its position after that read.
const log = [];
function mark(tag, value) { log.push(tag); return value; }
let viaMulti, tail, viaSole;
[{ [(mark('k'), 'at')]: viaMulti }, tail] = [mark('r', Array.prototype), 7];
[{ [(mark('s'), 'flat')]: viaSole }] = [mark('e', Array.prototype)];
export { viaMulti, tail, viaSole, log };
