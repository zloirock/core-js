import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// an EXPORTED flatten-claimed declaration whose LATER declarator memoizes an SE-key receiver:
// the routed memo takes the non-exported statement form ahead of the slot, so the internal ref
// temp stays off the module's export surface while every user binding is re-exported. the
// for-init twin keeps the comma-declarator memo (a loop header cannot be exported)
const holder = {
  p: [1, 2, 3]
};
let k = 0;
export const from = _Array$from;
const _ref = holder.p;
export const {
    [(k++, 'flat')]: _unused
  } = _ref,
  fl = _flatMaybeArray(_ref);
console.log(from, fl, k);
for (const {
    of2
  } = _globalThis.Array, _ref2 = holder.p, {
    [(k++, 'at')]: _unused2
  } = _ref2, q = _atMaybeArray(_ref2); k < 0;) console.log(of2, q);