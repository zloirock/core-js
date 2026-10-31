import _Array$from from "@core-js/pure/actual/array/from";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A consumed nested slot lends its default to the overwrite.
// Rewrites inside that default must survive deferred emission.
let method;
method = (_ref = _at(receiver)) === void 0 ? _flatMapMaybeArray(_ref2 = _Array$from(source)).call(_ref2, project) : _ref;