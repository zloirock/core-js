// destructure init is optional-chain proxy-global: `const { from } = globalThis?.Array`.
// covers `globalProxyMemberName` callsite in unplugin destructure resolution
const { from } = globalThis?.Array;
from([1, 2, 3]);
