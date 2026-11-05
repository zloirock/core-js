// Computed keys over a selecting literal container keep their key effects and native boundaries.
// Only independently admitted claims are served; array-contained statics remain native.
const { Array: { [(log.push('k'), 'of')]: a, from: b } } = cnd && { Array };
const [{ Number: { [(log.push('k'), 'isInteger')]: c, isNaN: d } }] = [cnd && { Number }];
use(a, b, c, d);
