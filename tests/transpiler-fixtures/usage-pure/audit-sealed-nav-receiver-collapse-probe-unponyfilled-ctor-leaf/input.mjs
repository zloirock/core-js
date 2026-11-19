// A leaf without a pure constructor is read from the tested realm, never a local global-name binding.
// The sealed read must still throw on absence; its static claim still gets the polyfill.
export const unponyfilledCtorLeaf = (globalThis.window?.Array).of(1);
