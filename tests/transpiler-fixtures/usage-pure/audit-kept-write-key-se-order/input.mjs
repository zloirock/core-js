// a KEPT WRITE at the receiver's spine root with a LATER key side effect: the discarded
// read re-emits WHOLE (or splices flat in the array wrapper), so the write keeps LEADING
// the effects that followed it in the source - the split channels used to lift the key SE
// ahead of the write (`log` saw `undefined` where native sees `object`)
// the text sidecar differs in spelling only: the splice keeps the AUTHOR'S key parens
// (`[(se, "Array")]`) where the reprinters emit the minimal form
const log = [];
let r1;
const { of: o1 } = (r1 = globalThis)[(log.push(typeof r1), "Array")];
use(o1, r1);
let r2;
const [{ of: o2 }] = [(r2 = globalThis)[(log.push(typeof r2), "Array")]];
use(o2, r2);
let r3, o3;
({ of: o3 } = (r3 = globalThis)[(log.push(typeof r3), "Array")]);
use(o3, r3);
let r4;
const { of: o4 } = (log.push("s"), (r4 = globalThis))[(log.push(typeof r4), "Array")];
use(o4, r4);
let r5;
const { of: o5 } = globalThis[(log.push("k"), r5 = 1, "Array")];
use(o5, r5, log);
