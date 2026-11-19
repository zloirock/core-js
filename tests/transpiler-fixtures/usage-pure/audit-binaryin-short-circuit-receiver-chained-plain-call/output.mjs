import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref;
const words = ['ab', 'cd'];
export const chainedPlainCall = (_sliceMaybeArray(_ref = _concatMaybeArray(words).call(words, [])).call(_ref), true);