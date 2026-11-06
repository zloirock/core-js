// A receiver prefix precedes a nested computed key, then its sibling read.
// Captured from and keys claims retain that source order in const and let hosts.
const box = { w: Array, other: 1 };
const { w: { [(log('from'), 'from')]: from }, other } = (log('box'), box);
const holder = { v: Object, more: 2 };
let n = 0;
let { v: { [(log('keys'), 'keys')]: keys }, more } = (n++, holder);
use(from, other, keys, more, n);
