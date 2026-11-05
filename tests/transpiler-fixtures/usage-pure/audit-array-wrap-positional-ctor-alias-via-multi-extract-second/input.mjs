// Multiple constructor bindings from one array pattern retain separate identities.
// The later Promise.resolve read resolves through the second binding without rewriting the wrapper.
const [{ Symbol: SM }, { Promise: MG }] = [globalThis, globalThis];
export const viaMultiExtractSecond = MG.resolve(ready);
