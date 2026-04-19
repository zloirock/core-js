import _Array$from from "@core-js/pure/actual/array/from";
// destructure init is optional-chain proxy-global: `const { from } = globalThis?.Array`.
// covers `globalProxyMemberName` callsite in unplugin destructure resolution
const from = _Array$from;
from([1, 2, 3]);