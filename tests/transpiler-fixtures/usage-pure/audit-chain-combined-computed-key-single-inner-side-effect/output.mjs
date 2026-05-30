import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// computed-key outer WITH a side effect on a single-optional inner: the receiver is bound
// (`_ref.call(a)`) AND the effect folds into the combine's alternate (fires only on the
// non-short-circuit path). exercises receiver-preservation and SE-folding together in one combine
null == a || null == (_ref = _flatMaybeArray(a)) ? void 0 : (eff(), _includes(_ref2 = _ref.call(a)).call(_ref2, 2));