import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// Nested instance leaves under computed array elements keep sibling evaluations in source order.
// Each selected element is captured once before its nested pattern, including rest siblings and
// claims in later positions. Both legs narrow proven realm receivers and dispatch opaque ones
// generically, reading each selected receiver through its capture.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const realm = () => _globalThis;
const opaque = () => JSON.parse('{}');
const c = seen.length === 0;
const [_ref, _ref2] = [realm(), eff('t1')];
const a1 = _atMaybeArray(_ref.Array.prototype);
const t1 = _ref2;
const [_ref3, _ref4] = [opaque(), eff('t2')];
const a2 = _at(_ref3.Array.prototype);
const t2 = _ref4;
const [_ref5, _ref6] = [c ? _globalThis : realm(), eff('t3')];
const a3 = _at(_ref5.Array.prototype);
const t3 = _ref6;
const [_ref7, _ref8] = [null == _globalThis.window ? void 0 : _self, eff('t4')];
const a4 = _atMaybeArray(_ref7.Array.prototype);
const t4 = _ref8;
const [{
  Array: {
    prototype: {
      at: a5
    }
  }
}, ...r5] = [realm(), eff('t5')];
const [_ref9, _ref10] = [eff('t6'), realm()];
const t6 = _ref9;
const a6 = _atMaybeArray(_ref10.Array.prototype);
export { a1, t1, a2, t2, a3, t3, a4, t4, a5, r5, a6, t6, seen };