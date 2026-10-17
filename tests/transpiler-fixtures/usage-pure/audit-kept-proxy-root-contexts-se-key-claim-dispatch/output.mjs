import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
// SE-keyed hop under a claimed static + instance dispatch: the dispatch's guard memoizes the
// probe root only, so the hop-key SE rides the claim body on the non-null branch
export const seKeyClaimDispatch = null == _globalThis.window ? void 0 : _flatMaybeArray(_ref = (c++, _Array$of)(8)).call(_ref);