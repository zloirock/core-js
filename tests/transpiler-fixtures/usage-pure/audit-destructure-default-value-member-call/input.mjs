// proxy-global alias with default + static-method member call: `P` is recognised as
// a Promise binding, so `P.try(() => 1)` keeps resolving to the static method polyfill
// even after the default-value rewrite
const { Promise: P = null } = globalThis;
P.try(() => 1);
