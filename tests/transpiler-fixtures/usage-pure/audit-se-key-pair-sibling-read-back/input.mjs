// the SE-key trailing pair lands immediately AFTER its consumed declarator: a later declarator
// of the SAME declaration reads the extracted binding and must see the polyfill, not the
// hoisted-undefined pre-init value
const log = [];
const arr = [1, [2]];
var { [(log.push(1), 'flat')]: flat } = arr, viaFlat = flat;
// export host: the pair joins the exported declaration at the same slot
export var { [(log.push(2), 'at')]: at } = arr, viaAt = at;
// rest sibling keeps the residual; the pair still lands before the reader
var { [(log.push(4), 'flatMap')]: fm, ...rest } = arr, viaFm = fm;
// for-init head: a later head declarator reads the pair the same way
let out;
for (var { [(log.push(3), 'includes')]: inc } = arr, viaInc = inc, i = 0; i < 1; i++) out = viaInc;
export { viaFlat, viaFm, rest, out, log };
