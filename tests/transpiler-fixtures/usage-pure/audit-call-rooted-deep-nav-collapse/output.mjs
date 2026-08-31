import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4;
// a deeper nav under a non-proxy leaf chain with a CALL root: the receiver plan's member
// recursion must reach the call-rooted collapse exactly like the identifier-rooted twin
// (`_globalThis.foo`), never leave the raw `.window` hop standing over the inlined call
typeof _getIteratorMethod(_globalThis.foo);
typeof (null == (_ref = _globalThis.foo) ? void 0 : _getIteratorMethod(_ref));
typeof (null == (_ref2 = _globalThis.foo) ? void 0 : _getIteratorMethod(_ref2));
// boundary forms of the same collapse: an SE-bearing computed hop key keeps its effect as the
// collapsed base's prefix, and a computed user leaf keeps its own spelling over the folded base
let c = 0;
typeof (null == (_ref3 = (c++, _globalThis).foo) ? void 0 : _getIteratorMethod(_ref3));
typeof (null == (_ref4 = (c++, _globalThis)['foo-bar']) ? void 0 : _getIteratorMethod(_ref4));