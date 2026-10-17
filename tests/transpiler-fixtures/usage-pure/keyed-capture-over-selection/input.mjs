// A nested pattern moved onto a keyed capture over a selection reads whatever the selection
// yielded, its falsy left included: no static is read off the bare constructor there - a plain
// one goes through the identity guard or stays native, and the effectful key stays a native read.
const { Array: { [(log.push('k'), 'of')]: a, from: b } } = cnd && { Array };
const [{ Number: { [(log.push('k'), 'isInteger')]: c, isNaN: d } }] = [cnd && { Number }];
use(a, b, c, d);
