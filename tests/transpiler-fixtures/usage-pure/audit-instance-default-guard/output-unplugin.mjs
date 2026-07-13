import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref4, _ref5, _ref6, _ref7, _ref9;
// an instance dispatcher may return undefined on a foreign receiver (its own-property read),
// so a user default on an instance-extraction leaf stays LIVE behind the `=== void 0` guard;
// with a kept SE key the guarded extraction evaluates AFTER the key's effect (native order).
// static/global extractions keep dropping the default - their pure bindings are always defined

// standalone arm: trailing sibling declarator after the kept-key residual
const { [(e1(), 'at')]: _unused } = recvA, a = (_ref = _at(recvA)) === void 0 ? dfltA() : _ref;

// sibling-declarator arm: the guarded extraction lands between the residual and the sibling
const { [(e2(), 'flat')]: _unused2 } = recvB, f = (_ref2 = _flatMaybeArray(recvB)) === void 0 ? dfltB() : _ref2, other = 1;

// memoized const-literal receiver: the memo ref numbers before the guard ref
const _ref3 = [7, 8];
const { [(e3(), 'includes')]: _unused3 } = _ref3, i = (_ref4 = _includesMaybeArray(_ref3)) === void 0 ? dfltC() : _ref4;

// eliminate arm (array-wrapped sole binding, pure key): no residual survives, the guard
// wraps the extraction in place
const toReversed = (_ref5 = _toReversedMaybeArray(recvD)) === void 0 ? dfltD() : _ref5;

// native evaluates a destructure PER PROP (key, read, default, next key): the residual
// splits at a live-defaulted entry, so its guard runs BEFORE the following prop's key
// effect, and post-split entries ride the same trailing chain
const { [(e4(), 'findLast')]: _unused4 } = recvE, fl = (_ref6 = _findLastMaybeArray(recvE)) === void 0 ? dfltE() : _ref6, { [(e5(), 'findLastIndex')]: _unused5 } = recvE, fli = _findLastIndexMaybeArray(recvE);

// rest keeps the pattern whole (rest gathers by exclusion of its own pattern's keys), so
// keys batch before the guard - a documented boundary
const { [(e6(), 'toSorted')]: _unused6, ...restF } = recvF, ts = (_ref7 = _toSortedMaybeArray(recvF)) === void 0 ? dfltF() : _ref7;

// memoized receiver + split: both segments and the guard read the shared ref; the extraction
// PLACEMENT differs per emitter (the text emitter's preceding statements vs the AST emitter's
// comma chain - a pre-existing cosmetic, side-effect order is identical)
const _ref8 = [9];
const { [(e7(), 'with')]: _unused7 } = _ref8, w7 = (_ref9 = _withMaybeArray(_ref8)) === void 0 ? dfltG() : _ref9, { [(e8(), 'toSpliced')]: _unused8 } = _ref8, t8 = _toSplicedMaybeArray(_ref8);

export { a, f, i, toReversed, other, fl, fli, ts, restF, w7, t8 };