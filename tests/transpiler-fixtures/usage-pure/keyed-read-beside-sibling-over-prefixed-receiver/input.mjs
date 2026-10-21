// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
const box = { w: Array, other: 1 };
const { w: { [(log('from'), 'from')]: from }, other } = (log('box'), box);
const holder = { v: Object, more: 2 };
let n = 0;
let { v: { [(log('keys'), 'keys')]: keys }, more } = (n++, holder);
use(from, other, keys, more, n);
