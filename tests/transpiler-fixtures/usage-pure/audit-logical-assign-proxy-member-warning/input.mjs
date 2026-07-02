// multiple proxy-global member logical-assigns in one file - each surfaces its own
// warning tagged with the pre-transform global name (`Symbol`, `WeakMap`), not the
// post-rewrite identifier, so the diagnostic stays readable
globalThis.Symbol ||= {};
globalThis.WeakMap ||= {};
