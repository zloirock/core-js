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
// HOST axis of the instance-default guard: every binding host preserves the user default
// behind the `=== void 0` guard, and a split host keeps the native per-prop order

// plain block declaration, unknown receiver - the per-prop channel's guard
const a = (_ref6 = _at(recvA)) === void 0 ? dfltA() : _ref6;

// plain assignment cascade
let fl;
fl = (_ref5 = _flatMaybeArray(recvB)) === void 0 ? dfltB() : _ref5;

// typed receiver: the type-specific dispatcher is still guarded (uniform shape); the
// default is dead at runtime post-polyfill
const inc = (_ref4 = _includesMaybeArray([1, 2])) === void 0 ? dfltC() : _ref4;

// parameter default: the synth literal carries the dispatcher, the pattern keeps the
// user default (fires when the dispatcher read is undefined)
function fnG({ findLast: fnl = dfltD() } = { findLast: _findLastMaybeArray(recvD) }) { return fnl; }
export const g = fnG();

// for-init host: the guarded extraction and the split segment join the loop header
let out1;
for (const { [(e1(), 'findLastIndex')]: _unused } = recvE, fli = (_ref = _findLastIndexMaybeArray(recvE)) === void 0 ? dfltE() : _ref, { [(e2(), 'toSorted')]: _unused2 } = recvE, tso = _toSortedMaybeArray(recvE); !out1;) out1 = [fli, tso];

// export host: the split keeps every binding exported
export const { [(e3(), 'toReversed')]: _unused3 } = recvF, trv = (_ref2 = _toReversedMaybeArray(recvF)) === void 0 ? dfltF() : _ref2, { [(e4(), 'flatMap')]: _unused4 } = recvF, fm = _flatMapMaybeArray(recvF);

// bodyless control-slot host: the block-wrap and the split compose
if (cnd) var { [(e5(), 'with')]: _unused5 } = recvG, w5 = (_ref3 = _withMaybeArray(recvG)) === void 0 ? dfltG() : _ref3, { [(e6(), 'toSpliced')]: _unused6 } = recvG, tsp = _toSplicedMaybeArray(recvG);

export { a, fl, inc, out1, w5, tsp };