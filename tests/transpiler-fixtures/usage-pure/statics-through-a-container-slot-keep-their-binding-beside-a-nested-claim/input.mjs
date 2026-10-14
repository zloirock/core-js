// A static read through a container slot, in a nested level whose instance claim reads the level through one
// memo: the static still binds its ponyfill once, and an effectful key it was read by still runs in the
// residual where the source wrote it - beside a plain nested pattern, beside a defaulted one, whose level
// the claims take apart declarator by declarator, and with both together.
const box = { A: Array, B: Promise };
const { A: { [(e(), 'from')]: from, name, other: { q } } } = box;
const { B: { all, name: label, more: { r } = { r: 6 } } } = box;
const { A: { [(e(), 'of')]: of, name: title, last: { t } = { t: 7 } } } = box;
use(from, name, q, all, label, r, of, title, t);
