// a REST element forces the param-default fallback (no whole synth-swap), and a side-effecting
// computed proxy-hop KEY cannot be single-hop-deleted (that would drop the effect): the shared
// root-collapse harvests the key SE as a sequence prefix and re-roots, so the default reads
// `(eff++, _globalThis).Array` instead of keeping the raw hop (undefined `.self` off-browser)
let eff = 0;
function f({ from, ...rest } = globalThis[(eff++, 'self')].Array) { return [from, rest]; }
f();

// each operand of a retained logical default takes the same per-operand dispatch
function g({ of, ...rest } = globalThis[(eff++, 'self')].Array || Set) { return [of, rest]; }
g();

// MULTIPLE polyfilled props re-enter the collapse with the SAME receiver (the fallback runs
// per prop) - the once-guard keeps the second entry from queueing an equal-range twin
function m({ from, of, ...rest } = globalThis[(eff++, 'self')].Array) { return [from, of, rest]; }
m();
function n({ isArray, from: f2, ...rest } = globalThis.self.Array) { return [isArray, f2, rest]; }
n();

// a PURE-CTOR leaf (`.Map`) static-folds the WHOLE hop chain to the pure constructor
// binding - the harvested key SE rides as its sequence prefix - where the `.Array` rows
// above re-root and KEEP the leaf member read
function p({ groupBy, ...rest } = globalThis[(eff++, 'self')].Map) { return [groupBy, rest]; }
p();

// a STATIC computed hop key keeps the plain single-hop delete
function h({ isArray, ...rest } = globalThis['self'].Array) { return [isArray, rest]; }
h();
