// a body that short-circuits internally reaches the same verdict through one test
export const shortCircuitBody = (() => globalThis.window?.self)()?.window?.Promise.resolve(4);
