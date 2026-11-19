import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A leaf without a pure constructor is read from the tested realm, never a local global-name binding.
// The sealed read must still throw on absence; its static claim still gets the polyfill.
export const unponyfilledCtorLeaf = ((_globalThis.window?.Array).of, _Array$of)(1);