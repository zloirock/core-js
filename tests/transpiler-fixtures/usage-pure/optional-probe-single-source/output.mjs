import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Several optional navigation links over one environment probe share its nullish branch.
// Array.from remains polyfilled on the defined continuation. No other claim supplies its import.
const probe = _globalThis.window;
export const navigation = null == probe ? void 0 : _Array$from([1]);