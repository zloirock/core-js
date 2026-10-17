// a receiver peeled from under an SE-bearing sequence prefix must not be read ahead of the
// prefix. The complete top-level initializer runs before any key effect or property read.
var { [(k1(), 'at')]: at, other } = (se1(), arr);
// A nested fragment captures the initializer before any key effect or claimed read.
const { y: { [(k2(), 'flat')]: flat }, q } = { y: (se2(), arr2), q: 1 };
const { z: { includes: inc }, w } = { z: (se3(), arr3), w: 1 };
// Assignment overwrite keeps the sequence prefix with its receiver. The prefix runs once before
// the method read, and the selected method is assigned to the target.
let m;
(({ v: { flatMap: m } } = { v: (se4(), arr4) }));
export const r = [at, other, flat, q, inc, w, m];
