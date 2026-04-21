// proxy-global alias with default + static-method member call. babel mutates to
// `const P = _Promise === void 0 ? null : _Promise`; `registerGlobalAlias('P', 'Promise')`
// keeps `P.try(...)` resolving to `_Promise$try`
const { Promise: P = null } = globalThis;
P.try(() => 1);
