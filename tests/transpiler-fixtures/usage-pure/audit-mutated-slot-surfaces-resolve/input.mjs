// surfaces of a mutated global SLOT beyond the static read: a replaced constructor DEOPTS -
// every read stays verbatim on the live binding, never the pristine ponyfill

// a bare `Ctor.prototype.<key>` read on a slot-replaced ctor stays raw like its static twin
// (the pristine `_Promise.prototype` swap silently dropped the shim)
globalThis.Promise = shimA;
// the static control keeps its locked canon
use(Promise.resolve(1));
