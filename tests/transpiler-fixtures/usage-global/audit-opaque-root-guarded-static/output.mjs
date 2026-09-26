import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// a static reached through an OPAQUE inline-call proxy-nav root under an OUTER instance
// dispatch: the guard keeps the raw root (its SE + short-circuit), and the resolved static
// pair earns its side-effect imports - call and FIELD spellings alike
const f = () => globalThis;
export const viaGuardedStaticCall = f()?.window?.Array.of(5).at(0);
const g = () => globalThis;
export const viaGuardedStaticField = g()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);

// NEGATIVE: a non-proxy call root keeps the whole chain native off the ref
const h = () => ({
  window: {
    Array: {
      of: x => [x, 'custom']
    }
  }
});
export const nonProxyStaysRaw = h()?.window?.Array.of(8).at(0);

// an SE-carrying sequence at the chain root: the memo assignment runs the effect exactly once
// in the guard test, so the branch reads the ponyfill leaf
let seCount = 0;
const eff = () => seCount++;
const k = () => globalThis;
export const seRootKeepsRef = (eff(), k())?.window?.Array.of(6).at(0);

// a COMPUTED trailing key with an SE evaluates after the collapsed static, in source order
let keyCount = 0;
const keySe = () => keyCount++;
const m = () => globalThis;
export const viaComputedTrailing = m()?.window?.Array.from([3])[keySe(), 'at'](0);

// optional spellings on the TRAILING dispatch keep their own guards over the collapsed static
const p = () => globalThis;
export const viaOptionalTrailing = p()?.window?.Promise.resolve(4)?.then?.(x => x);

// an SE-carrying inline BODY of the call root replays as a sequence prefix on the collapsed
// guard test (`(db(), _self).window`) - the effect runs exactly once, the branch reads the
// ponyfill leaf
let bodyCount = 0;
const db = () => {
  bodyCount++;
  return globalThis;
};
export const viaSeBodyRoot = db()?.self?.window?.Array.of(11).at(0);

// hops SWAPPED (the unresolvable window hop before the ponyfillable self hop): both optional
// objects share the window hop as their only source of undefined, so ONE nested test on the
// window prefix guards the chain and the branch still reads the ponyfill leaf
const dw = () => globalThis;
export const viaHopOrderSwap = dw()?.window?.self?.Array.of(12).at(0);

// an OPTIONAL call root of a proven const-bound callee guards like the plain call - the
// callee cannot be undefined, so the call adds no source of undefined
const oc = () => globalThis;
export const viaOptionalCallRoot = oc?.()?.window?.self?.Array.of(13).at(0);

// a SECOND unresolvable hop past the ponyfillable one stays raw on the guarded ref (two
// sources of undefined: the nested test covers the window prefix, the outer memo test the
// chrome value). the static reads off the opaque chrome value, not a global - no collapse.
// the vestigial `?.` spelling on the kept tail differs cosmetically between emitters
const upu = () => globalThis;
export const viaUnresPonyUnres = upu()?.window?.self?.chrome?.Array.of(14).at(0);

// a CHAIN-ASSIGN wrapper around the proven call root rides the nested test verbatim - the
// write runs exactly once, the branch reads the ponyfill leaf
let heldRoot;
const ca2 = () => globalThis;
export const viaChainAssignSwap = (heldRoot = ca2())?.window?.self?.Array.of(15).at(0);

// a CONST-bound computed hop key resolves like the dotted spelling - the nested test guards
// the window prefix and the branch reads the ponyfill leaf
const ck = () => globalThis;
const hopKey = 'self';
export const viaComputedMidHop = ck()?.window?.[hopKey]?.Array.of(16).at(0);

// NEGATIVE: a MAYBE-undefined callee (conditional assignment) is not provable - the chain
// keeps the raw guarded read off the ref
let mf;
if (globalThis.setTimeout) mf = () => globalThis;
export const viaMaybeUndefinedFn = mf?.()?.window?.self?.Array.of(17).at(0);

// a CHAIN-ASSIGN root with an SE-carrying provable body folds BOTH effects (the write and the
// body) into the sequence prefix, exactly once, and the branch reads the ponyfill leaf
let heldSe,
  seBodyCount = 0;
const cse = () => {
  seBodyCount++;
  return globalThis;
};
export const viaChainAssignSeBody = (heldSe = cse())?.self?.window?.Array.of(18).at(0);

// an SE-PREFIXED computed hop key still RESOLVES for the guard count (the effect stays live in
// the kept test text, in source order after the window test) - the branch reads the ponyfill
// leaf. the key parens spelling differs cosmetically between emitters
let keyEff = 0;
const sk = () => globalThis;
export const viaSeComputedOwnKey = sk()?.window?.[keyEff++, 'self']?.Array.of(19).at(0);

// a TEMPLATE-literal hop key resolves like the dotted spelling through the canonical key fold
const tk = () => globalThis;
export const viaTemplateKey = tk()?.window?.[`self`]?.Array.of(20).at(0);

// a NESTED provable wrapper (`f` returns `g()` which returns the global) proves through the
// same inline canon, layer by layer
const ng = () => globalThis;
const nf = () => ng();
export const viaNestedCallRoot = nf()?.window?.self?.Array.of(21).at(0);

// a PLAIN (non-optional) ponyfillable tail hop collapses with the branch - only the optional
// window hop is a source of undefined
const pt = () => globalThis;
export const viaPlainTailStatic = pt()?.window?.self.Array.of(22).at(0);

// a DESTRUCTURE over the swapped-hop chain: the guard tests the SHORTEST object carrying the
// unresolvable hop (the window prefix), never a raw ponyfillable hop read; the helper receives
// the guarded value and keeps the native throw on the short-circuit path
const dsw = () => globalThis;
const {
  at: pickedSwapAt
} = dsw()?.window?.self?.Array.of(23);
export const viaDestructureOverSwap = pickedSwapAt;

// an IDENTITY-IIFE root (`((x) => x)(globalThis)`) proves through the identity-param inline
// canon: the buried global substitutes, the live window test guards the chain, the branch
// reads the ponyfill leaf. the guard-shape spelling differs cosmetically between emitters
export const viaIdentityRoot = (x => x)(globalThis)?.window?.self?.Array.of(24).at(0);

// an SE-carrying ARG of the identity root rides the kept test, exactly once, in source order
let idEff = 0;
export const viaIdentitySeArg = (x => x)((idEff++, globalThis))?.window?.self?.Array.of(25).at(0);

// the plain (no-optional-chain) identity spelling folds the receiver into a sequence with the
// collapsed static - the arg effect and the buried-global substitution both survive
let seqEff = 0;
export const viaIdentitySeqStatic = (x => x)((seqEff++, globalThis)).Array.of(26);

// NEGATIVE: mutually-recursive wrappers never prove (the cycle guard stops the inline walk) -
// the chain keeps the raw guarded read off the ref
const cyc1 = () => cyc2();
const cyc2 = () => cyc1();
export const viaCyclicAliasKeepsRef = cyc1()?.window?.self?.Array.of(27).at(0);

// NEGATIVE: a binding SHADOWING the global name (a parameter) keeps the raw identifier - the
// buried-global proof and the substitution both respect scope
function shadowWrap(globalThis) {
  return (x => x)(globalThis)?.window?.self?.Array.of(28).at(0);
}
export const viaShadowedGlobal = shadowWrap;

// a VALUE-OBSERVING carrier (`??`) between the guarded chain and the static keeps the read on
// the carrier RESULT (the fallback object may own the key) - no collapse past the carrier; the
// root SE runs once inside the kept test
const nc = () => globalThis;
export const viaNullishCarrier = (nc()?.window?.self ?? {
  Array
}).Array.of(29).at(0);

// a LOGICAL retest spells each leg through the same nested canon - the left leg keeps its own
// guarded read, the right leg guards the dispatch
const lg = () => globalThis;
export const viaLogicalRetest = lg()?.window?.self && lg()?.window?.self?.Array.of(30).at(0);

// a CTOR read through the guarded identity chain: the guard tests the window prefix, both
// legs construct the ponyfill (`new _Map`) - the arrow-paren reprint differs cosmetically
export const viaIdentityCtorNew = (x => x)(globalThis)?.window?.Map && new ((x => x)(globalThis).Map)([[1, 2]]).size;

// an ALIAS holding an undefinable nav keeps its `?.` LIVE (the runtime VALUE is the nav's,
// not the always-defined global the prefix walk sees) - the claim composes PLAIN into the
// single outer test
let navAlias;
navAlias = globalThis.window?.self.window;
export const viaAliasNavRead = navAlias?.Array.of(31).at(0);

// an ALIAS of the provable callee follows transitively (identifier hops re-anchor at their
// own declaration scope), so the aliased call proves like the direct one
const mkRoot = () => globalThis;
const aliasedMk = mkRoot;
export const viaCalleeAlias = aliasedMk()?.window?.self?.Array.of(32).at(0);

// NEGATIVE: an alias of a PARAM-bound callee is an arbitrary caller value - the chain keeps
// the raw guarded read
export function viaCalleeParamAlias(mkRoot) {
  const inner = mkRoot;
  return inner()?.window?.self?.Array.of(33).at(0);
}

// the callee alias still proves under a same-name param SHADOW of the source binding - the
// alias holds the module-level arrow, the shadow never feeds it
export function viaCalleeAliasShadowed(mkRoot) {
  return aliasedMk()?.window?.self?.Array.of(34).at(0);
}

// NEGATIVE: the callee alias captured the SOURCE before its reassignment - the reassigned
// source bails and the chain keeps the raw guarded read (the capture holds whatever the
// program put there)
let swapMk = () => ({
  window: null
});
const heldMk = swapMk;
swapMk = () => globalThis;
export const viaReassignedSourceCallee = heldMk()?.window?.self?.Array.of(35).at(0);