// a MEMOIZED synth-swap receiver (SE-bearing, >=1 unpolyfilled key) takes the same canonical
// re-read target as the direct path: pure-ctor leaf whole-swaps with the erased navigation's
// effects harvested ahead of the binding; an alias root keeps its identifier and only drops
// the dead hop; a direct root collapses to the proxy import. before this was single-sourced,
// each memo arg fell to a per-emitter fallback (verbatim clone re-traverse vs shared-resolver
// pre-claim) - divergent targets, kept dead hops, and one side dropping the buried key SE
const g = globalThis;
function eff() { return null; }
function aliasPureCtor({ groupBy, other } = (eff(), g.self.Map) || null) { return [groupBy, other]; }
aliasPureCtor();

function aliasNonPureLeaf({ fromEntries, missing } = (eff(), g.self.Object) || null) { return [fromEntries, missing]; }
aliasNonPureLeaf();

// the buried leaf-key side effect survives the whole-swap, re-run ahead of the binding
let e = 0;
function leafKeySe({ try: t, absent } = globalThis.self[(e++, 'Promise')]) { return [t, absent]; }
leafKeySe();

// hop-key SE: the erased `self` hop's key effect is harvested the same way
let tick = 0;
function hopKeySe({ groupBy: gb, more } = globalThis[(tick++, 'self')].Map) { return [gb, more]; }
hopKeySe();

// direct-root non-pure leaf control: seq prefix stays, root substitutes, leaf reads native
function directNonPure({ hasOwn, extra } = (eff(), globalThis.self.Object) || null) { return [hasOwn, extra]; }
directNonPure();

// a kept prefix composes its own inner rewrites: the global read inside the surviving
// side effect substitutes even though the navigation around it is erased
function innerGlobal({ groupBy: g4, none } = (globalThis.tick(), globalThis.Map) || null) { return [g4, none]; }
innerGlobal();

// an SE-bearing chain-root call survives the whole-swap in the rescue plan; a provably-pure
// inline root call is dropped instead (value-identical, effect-free)
let n = 0;
function seCallRoot({ groupBy: g3, gone } = (() => (n++, globalThis))().Map) { return [g3, gone]; }
seCallRoot();

// unresolvable call root: conservative verbatim bail on both emitters
function mk() { return null; }
function callRootBail({ union, rest } = mk().self.Set) { return [union, rest]; }
callRootBail();
