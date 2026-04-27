import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// regex-literal closer `/` must be treated as a fuse-with-`(` boundary by the ASI
// guard. without `;` injection the parser reads `/foo/\n(...)` as a CallExpression
// (regex invoked as function - TypeError at runtime); same boundary covers division
// operator (`a / b\n(c)` -> `a / (b(c))` - silent arithmetic shift)
let r = /foo/;
(null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, y => y)) + 1;