import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// ... and the same rule where the render is the STORE's own: the wrapper over the span it replaces
// goes with it, in whatever host the run stands (the declarator answered it first, and the other
// hosts reach this render through their own routes)
let stored: any;
export const inTemplate = `${(stored = _globalThis, _self).customProp}`;
export { stored };