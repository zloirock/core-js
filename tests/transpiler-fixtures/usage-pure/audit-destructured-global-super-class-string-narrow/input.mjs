// Destructured-global superclass with a different constructor than Array: String here, so the
// recovery is shown to be constructor-agnostic. `at` must narrow through the inheritance to the
// String instance polyfill (string-specific helper) despite the proxy global being rewritten to its UID.
const { String } = globalThis;
class X extends String {}
new X().at(0);
