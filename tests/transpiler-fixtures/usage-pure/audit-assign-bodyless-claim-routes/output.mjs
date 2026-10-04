import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
var _ref, _ref2, _unused;
// Bodyless assignments preserve conditional receiver evaluation and ordered property reads.
// Static and instance claims receive polyfills while sibling reads, rest and receiver stores survive.
const log = [];
let from, rest, keyed, other, nested, sibling, kw, prefixed;
if (log.length >= 0) from = _Array$from, {
  from: _unused,
  ...rest
} = Array;
// A computed key runs before its property read and before the following sibling read.
if (log.length >= 0) _ref = [3, [7]], null == _ref ? _ref[""] : (_pushMaybeArray(log).call(log, "k"), keyed = _atMaybeArray(_ref)), {
  other
} = _ref;
// An unconsumed sibling remains a native read while the nested static receives its polyfill.
if (log.length >= 0) ({
  Map: {
    groupBy: nested
  },
  sibling
} = {
  Map: {
    groupBy: _Map$groupBy
  },
  sibling: _globalThis.sibling
});
// A receiver prefix keeps its own inner polyfills and executes once before the binding.
if (log.length >= 0) {
  kw = (_pushMaybeArray(log).call(log, "e"), _globalThis);
  prefixed = _flatMaybeArray(_globalThis.Array.prototype);
}
// An array wrapper with a stored receiver remains conditional: its store and instance read
// must not run when the control condition is false.
let kwWrap, wrapped;
if (log.length < 0) {
  [_ref2] = [kwWrap = _globalThis];
  wrapped = _withMaybeArray(_ref2.Array.prototype);
}
export { from, rest, keyed, other, nested, sibling, kw, prefixed, kwWrap, wrapped, log };