// An assignment in the receiver runs before a later computed-key effect.
// The stored value and the static polyfill survive the receiver rewrite.
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
