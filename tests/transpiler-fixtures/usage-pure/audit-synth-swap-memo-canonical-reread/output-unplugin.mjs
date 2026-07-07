import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a MEMOIZED synth-swap receiver (SE-bearing, >=1 unpolyfilled key) takes the same canonical
// re-read target as the direct path: pure-ctor leaf whole-swaps with the erased navigation's
// effects harvested ahead of the binding; an alias root keeps its identifier and only drops
// the dead hop; a direct root collapses to the proxy import. before this was single-sourced,
// each memo arg fell to a per-emitter fallback (verbatim clone re-traverse vs shared-resolver
// pre-claim) - divergent targets, kept dead hops, and one side dropping the buried key SE
const g = _globalThis;
function eff() { return null; }
function aliasPureCtor({ groupBy, other } = (function (_ref) { return { groupBy: _Map$groupBy, other: _ref.other }; })((eff(), _Map))) { return [groupBy, other]; }
aliasPureCtor();

function aliasNonPureLeaf({ fromEntries, missing } = (function (_ref2) { return { fromEntries: _Object$fromEntries, missing: _ref2.missing }; })((eff(), g.Object))) { return [fromEntries, missing]; }
aliasNonPureLeaf();

// the buried leaf-key side effect survives the whole-swap, re-run ahead of the binding
let e = 0;
function leafKeySe({ try: t, absent } = (function (_ref3) { return { try: _Promise$try, absent: _ref3.absent }; })((e++, _Promise))) { return [t, absent]; }
leafKeySe();

// hop-key SE: the erased `self` hop's key effect is harvested the same way
let tick = 0;
function hopKeySe({ groupBy: gb, more } = (function (_ref4) { return { groupBy: _Map$groupBy, more: _ref4.more }; })((tick++, _Map))) { return [gb, more]; }
hopKeySe();

// direct-root non-pure leaf control: seq prefix stays, root substitutes, leaf reads native
function directNonPure({ hasOwn, extra } = (function (_ref5) { return { hasOwn: _Object$hasOwn, extra: _ref5.extra }; })((eff(), _globalThis.Object))) { return [hasOwn, extra]; }
directNonPure();

// a kept prefix composes its own inner rewrites: the global read inside the surviving
// side effect substitutes even though the navigation around it is erased
function innerGlobal({ groupBy: g4, none } = (function (_ref6) { return { groupBy: _Map$groupBy, none: _ref6.none }; })((_globalThis.tick(), _Map))) { return [g4, none]; }
innerGlobal();

// an SE-bearing chain-root call survives the whole-swap in the rescue plan; a provably-pure
// inline root call is dropped instead (value-identical, effect-free)
let n = 0;
function seCallRoot({ groupBy: g3, gone } = (function (_ref7) { return { groupBy: _Map$groupBy, gone: _ref7.gone }; })(((() => (n++, _globalThis))(), _Map))) { return [g3, gone]; }
seCallRoot();

// unresolvable call root: conservative verbatim bail on both emitters
function mk() { return null; }
function callRootBail({ union, rest } = mk().self.Set) { return [union, rest]; }
callRootBail();