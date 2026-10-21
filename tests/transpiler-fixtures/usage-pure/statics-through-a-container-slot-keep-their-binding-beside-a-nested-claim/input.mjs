// Shared capture and receiver-default routes preserve independently supported claims.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
const box = { A: Array, B: Promise };
const { A: { [(e(), 'from')]: from, name, other: { q } } } = box;
const { B: { all, name: label, more: { r } = { r: 6 } } } = box;
const { A: { [(e(), 'of')]: of, name: title, last: { t } = { t: 7 } } } = box;
use(from, name, q, all, label, r, of, title, t);
