import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2, _ref3;
// chain-combine receiver that is itself a polyfilled static call (`Array.from(...)`): the static
// must resolve to its pure binding (`_Array$from`) inside the memoized receiver, not stay raw.
// keeping the receiver subtree visitable lets the static rewrite reach it
null == (_ref = _Array$from(src)) || null == (_ref2 = _flatMaybeArray(_ref)) ? void 0 : _atMaybeArray(_ref3 = _ref2.call(_ref)).call(_ref3, 0);