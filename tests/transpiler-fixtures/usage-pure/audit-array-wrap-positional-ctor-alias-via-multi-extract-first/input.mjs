// Multiple constructor bindings from one array pattern retain separate identities.
// The later Symbol.for read resolves through the first binding without rewriting the wrapper.
const [{ Symbol: SM }, { Promise: MG }] = [globalThis, globalThis];
export const viaMultiExtractFirst = SM.for(dedupeKey);
