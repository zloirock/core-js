// a detect spelled through a realm hop or off a static reads the slot before its write lands: core-js wins
// it on the first pass, the fallback after it dead, as for the bare spelling. usage-pure only: the global
// flavor rewrites no read
window.Promise = window.Promise || PromiseShim;
globalThis.AggregateError = globalThis.AggregateError || AggregateErrorShim;
Array.from = Array.from || arrayFrom;
if (globalThis) globalThis.Iterator = globalThis.Iterator || IteratorShim;
