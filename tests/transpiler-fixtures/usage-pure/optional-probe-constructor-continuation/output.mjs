import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// The optional constructor read keeps the environment probe's nullish branch.
// Array.of is polyfilled on the defined continuation; this is the only static claim in the file.
const probe = _globalThis.window;
export const constructor = null == probe ? void 0 : _Array$of(2);