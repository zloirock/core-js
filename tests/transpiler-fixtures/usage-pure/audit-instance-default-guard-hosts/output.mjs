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
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
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
for (const {} = recvE, fli = (e1(), (_ref4 = _findLastIndexMaybeArray(recvE)) === void 0 ? dfltE() : _ref4), tso = null == recvE ? recvE[""] : (e2(), _toSortedMaybeArray(recvE)); !out1;) out1 = [fli, tso];

// export host: the split keeps every binding exported
const {} = recvF,
  trv = (e3(), (_ref5 = _toReversedMaybeArray(recvF)) === void 0 ? dfltF() : _ref5),
  fm = null == recvF ? recvF[""] : (e4(), _flatMapMaybeArray(recvF));
export { trv, fm }; // bodyless control-slot host: the `var` join and the split compose
if (cnd) var {} = recvG,
  w5 = (e5(), (_ref6 = _withMaybeArray(recvG)) === void 0 ? dfltG() : _ref6),
  tsp = null == recvG ? recvG[""] : (e6(), _toSplicedMaybeArray(recvG));
export { a, fl, inc, out1, w5, tsp };