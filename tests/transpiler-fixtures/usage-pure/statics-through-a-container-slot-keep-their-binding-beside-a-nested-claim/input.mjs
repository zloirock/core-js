// Captured statics and function-name leaves keep their bindings beside deeper native claims.
// Computed keys and nested defaults remain in source order.
const box = { A: Array, B: Promise };
const { A: { [(e(), 'from')]: from, name, other: { q } } } = box;
const { B: { all, name: label, more: { r } = { r: 6 } } } = box;
const { A: { [(e(), 'of')]: of, name: title, last: { t } = { t: 7 } } } = box;
use(from, name, q, all, label, r, of, title, t);
