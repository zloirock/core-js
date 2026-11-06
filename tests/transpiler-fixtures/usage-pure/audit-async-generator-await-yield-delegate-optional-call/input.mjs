// the optional-call twin of the plain `yield* await inner()` delegate: an OPTIONAL call is still a
// call, so `make?.()` must resolve the delegate's TReturn from the callee signature exactly as
// `make()` does. Both lines take a method that exists on more than one receiver family, and the two
// methods differ, so a narrowing that survives only on the plain call shows up as the string family
// joining the import set rather than being masked.
async function* make(): AsyncGenerator<string, number[], void> { yield 'a'; return [1]; }
async function* viaPlainCall() { const r = yield* await make(); return r.includes(1); }
async function* viaOptionalCall() { const r = yield* await make?.(); return r.at(0); }
viaPlainCall();
viaOptionalCall();
