// A static read through a container slot, in a nested level whose instance claim reads the level through one
// memo: the static still binds its ponyfill once, and an effectful key it was read by still runs in the
// residual where the source wrote it - beside a plain nested pattern, beside a defaulted one, whose level
// the claims take apart declarator by declarator, and with both together.
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise from "@core-js/pure/actual/promise/constructor";

const box = { A: Array, B: _Promise };
const _ref = box.A;
const from = _Array$from;
const name = _nameMaybeFunction(_ref);
const { [(e(), 'from')]: _unused, other: { q } } = _ref;
const all = _Promise$all;
const _ref2 = box.B;
const label = _nameMaybeFunction(_ref2);
const { more: { r } = { r: 6 } } = _ref2;
const _ref3 = box.A;
const of = _Array$of;
const { [(e(), 'of')]: _unused2 } = _ref3;
const title = _nameMaybeFunction(_ref3);
const { last: { t } = { t: 7 } } = _ref3;

use(from, name, q, all, label, r, of, title, t);