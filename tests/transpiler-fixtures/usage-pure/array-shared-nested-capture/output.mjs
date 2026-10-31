import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A shared nested receiver is captured once before its independent property reads.
// Native siblings keep their position; each typed method keeps its own polyfill.
const [_ref] = [{
  w: [2, 7],
  y: 'abc'
}, mark()];
const {
  w: _ref2
} = _ref;
const at = _atMaybeArray(_ref2);
const {
  length
} = _ref2;
const includes = _includesMaybeString(_ref.y);
use(at, length, includes);