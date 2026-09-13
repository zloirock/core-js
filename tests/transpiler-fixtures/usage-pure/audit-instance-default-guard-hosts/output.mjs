import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref6, _ref10, _ref14;
// Every binding host preserves user defaults for undefined extraction results.
// Split declarations keep the native per-property order, scope and exported bindings.
// plain block declaration, unknown receiver - the per-prop channel's guard
const a = (_ref = _at(recvA)) === void 0 ? dfltA() : _ref; // plain assignment cascade
let fl;
fl = (_ref2 = _flatMaybeArray(recvB)) === void 0 ? dfltB() : _ref2;

// typed receiver: the type-specific dispatcher is still guarded (uniform shape); the
// default is dead at runtime post-polyfill
const inc = (_ref3 = _includesMaybeArray([1, 2])) === void 0 ? dfltC() : _ref3; // parameter default: the synth literal carries the dispatcher, the pattern keeps the
// user default (fires when the dispatcher read is undefined)
function fnG({
  findLast: fnl = dfltD()
} = {
  findLast: _findLastMaybeArray(recvD)
}) {
  return fnl;
}
export const g = fnG();

// for-init host: the guarded extraction and the split segment join the loop header
let out1;
for (const _ref4 = recvE, _ref5 = _ref4, fli = null == _ref5 ? _ref5[""] : (e1(), (_ref6 = _findLastIndexMaybeArray(_ref5)) === void 0 ? dfltE() : _ref6), _ref7 = _ref4, tso = null == _ref7 ? _ref7[""] : (e2(), _toSortedMaybeArray(_ref7)); !out1;) out1 = [fli, tso];

// export host: the split keeps every binding exported
const _ref8 = recvF,
  _ref9 = _ref8,
  trv = null == _ref9 ? _ref9[""] : (e3(), (_ref10 = _toReversedMaybeArray(_ref9)) === void 0 ? dfltF() : _ref10),
  _ref11 = _ref8,
  fm = null == _ref11 ? _ref11[""] : (e4(), _flatMapMaybeArray(_ref11));
export { trv, fm }; // bodyless control-slot host: the `var` join and the split compose
if (cnd) var _ref12 = recvG,
  _ref13 = _ref12,
  w5 = null == _ref13 ? _ref13[""] : (e5(), (_ref14 = _withMaybeArray(_ref13)) === void 0 ? dfltG() : _ref14),
  _ref15 = _ref12,
  tsp = null == _ref15 ? _ref15[""] : (e6(), _toSplicedMaybeArray(_ref15));
export { a, fl, inc, out1, w5, tsp };