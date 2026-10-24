import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref, _ref2, _ref3, _ref4, _ref5;
// A computed Symbol.iterator key with an effect, read behind a deeper `?.`, short-circuits with the
// chain: the guard tests the probe, and the alternate reads the receiver past it into a memo ahead
// of the key, so the key runs only off a present value and after the read it follows. A receiver
// sealed by parens reads plainly and hands the helper whatever it produced.
let n = 0;
box == null ? void 0 : (_ref = box.list, n++, _getIterator(_ref));
null == (e(), box) ? void 0 : (_ref2 = box.items, n++, _getIterator(_ref2)).next();
null == (_ref3 = get()) ? void 0 : (_ref4 = _ref3.rows, n++, _getIteratorMethod(_ref4));
_ref5 = box?.cells, n++, _getIterator(_ref5);