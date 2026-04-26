// global call wrapped in TS `as` `((globalThis as any).Map)(...)`: the cast is peeled
// so the polyfill rewrite recognises the call.
(Map as any)();
