// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// A computed-key instance binding completes in its original declarator slot before a later
// declarator reads it. The key effect runs once before the method read, including exported
// and for-init declarations.
const log = [];
const arr = [1, [2]];
var { [(log.push(1), 'flat')]: flat } = arr, viaFlat = flat;
// An export host keeps the binding before its later reader without exporting a temporary.
export var { [(log.push(2), 'at')]: at } = arr, viaAt = at;
var { [(log.push(4), 'flatMap')]: fm, ...rest } = arr, viaFm = fm;
// A later for-init declarator observes the completed method binding the same way.
let out;
for (var { [(log.push(3), 'includes')]: inc } = arr, viaInc = inc, i = 0; i < 1; i++) out = viaInc;
export { viaFlat, viaFm, rest, out, log };
