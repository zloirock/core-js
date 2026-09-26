import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref7, _ref8, _ref9;
// Positional captures retain nested array slots and read their claims in source order.
// Each declarator completes before the next one evaluates, across the supported host forms.
const seen = [];
const mk = () => ({
  get y() {
    _pushMaybeArray(seen).call(seen, 'y');
    return [7, 8];
  }
});
const rows = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12]];
const pair = [mk(), {
  get z() {
    _pushMaybeArray(seen).call(seen, 'z');
    return [1];
  }
}];
const nested = [[mk()], [[3, 4]]];
const [_ref, _ref2, _ref3, _ref4, _ref5, _ref6] = rows;
const a1 = _atMaybeArray(_ref);
const b1 = _atMaybeArray(_ref2);
const c1 = _atMaybeArray(_ref3);
const d1 = _atMaybeArray(_ref4);
const e1 = _atMaybeArray(_ref5);
const f1 = _atMaybeArray(_ref6);
let a2, b2, c2;
[_ref7, _ref8, _ref9] = rows;
a2 = _atMaybeArray(_ref7);
b2 = _atMaybeArray(_ref8);
c2 = _atMaybeArray(_ref9);
const [_ref10,, _ref11] = rows;
const a3 = _atMaybeArray(_ref10);
const c3 = _atMaybeArray(_ref11);
const [_ref12, _ref13, ..._ref14] = rows;
const a4 = _atMaybeArray(_ref12);
const b4 = _atMaybeArray(_ref13);
const rest4 = _ref14;
const [[_ref15], [_ref16]] = nested;
const a5 = _atMaybeArray(_ref15.y);
const b5 = _atMaybeArray(_ref16);
const [_ref17, _ref18] = rows;
const a6 = _atMaybeArray(_ref17);
export const b6 = _includesMaybeArray(_ref18);
export { a6 };
let r7;
for (const _ref21 of [rows]) {
  let [_ref19, _ref20] = _ref21;
  let a7 = _atMaybeArray(_ref19);
  let b7 = _includes(_ref20);
  r7 = [a7, b7];
}
let r8;
for (const [_ref22, _ref23] = rows, a8 = _atMaybeArray(_ref22), b8 = _includesMaybeArray(_ref23); !r8;) r8 = [a8, b8];
let r9;
if (rows) {
  const [_ref24, _ref25] = rows;
  const a9 = _atMaybeArray(_ref24);
  const b9 = _includesMaybeArray(_ref25);
  r9 = [a9, b9];
}
const x10 = 1;
const [_ref26, _ref27] = rows;
const a10 = _atMaybeArray(_ref26);
const b10 = _includesMaybeArray(_ref27);
const y10 = 2;
const [_ref28, _ref29] = pair;
const a11 = _atMaybeArray(_ref28.y);
const b11 = _includesMaybeArray(_ref29.z);
export { a1, b1, c1, d1, e1, f1, a2, b2, c2, a3, c3, a4, b4, rest4, a5, b5, r7, r8, r9, x10, a10, b10, y10, a11, b11, seen };