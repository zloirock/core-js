import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// the optional-chain ROOT is memoized before the tail is rewritten, and the tagger that names the
// memo's object resolves it with no path of its own. the name it resolves is an init-less
// declarator whose single clean write is the value, so the dominance test has no read to anchor
let w;
w = box;
null == (_ref = w?.a) ? void 0 : _flatMaybeArray(_ref2 = _ref.b).call(_ref2);