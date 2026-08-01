// a PAREN-SEALED undefinable nav as a chain root: the seal ends the inner chain, so the outer
// `?.` guards the sealed VALUE - which CAN be undefined (the live inner `?.` tests an
// unresolvable window read). the claim renders GUARDED with the canonical nested test; eating
// the guard ran the branch where native short-circuits (a wrong value off-browser)
export const viaSealedOptTail = (globalThis.window?.self.window)?.Array.of(3).at(0);

// the same shape as a parameter default renders identically
export function viaParamDefault(x = (globalThis.window?.self.window)?.Number.MAX_SAFE_INTEGER.toFixed(2)) {
  return x;
}

// the UNSEALED spelling shares one source of undefined - the window hop - and the same
// nested test guards it
export const viaUnsealedChain = globalThis.window?.self.window?.Map;

// NEGATIVE: a PLAIN value-use of the sealed nav collapses to the root - the internal `?.`
// short-circuits only the sealed value, the plain read observes it (throw semantics), and the
// non-claimable leaf keeps the locked navigation-drop canon
export const viaPlainValueUse = (globalThis.window?.self.window).Array;

// the sealed root serves every OPTIONAL claim spelling like the alias of the same value:
// the METHOD-call claim folds into the guard, the CALL tail rides the branch (the guard-paren
// seam differs cosmetically between emitters), the DESTRUCTURE extraction receives the
// guarded value, and the bare CTOR read claims like the unsealed litErased canon
export const viaSealedMethodCall = (globalThis.window?.self.window)?.Array.of?.(3);
export const viaSealedCallTail = (globalThis.window?.self.window)?.Promise.resolve(4)?.then?.(x => x);
export const { at: viaSealedDestructure } = (globalThis.window?.self.window)?.Array.of(9);
export const viaSealedCtorRead = (globalThis.window?.self.window)?.Map;

// PLAIN claims through the sealed root ERASE receiverless like the alias spelling (the seal
// ends the inner chain; the plain read declares the value) - call, destructure and the
// claimable ctor value-use alike
export const viaSealedPlainCall = (globalThis.window?.self.window).Array.of(6).at(0);
export const { at: viaSealedPlainDestructure } = (globalThis.window?.self.window).Array.of(7);
export const viaSealedPlainCtorRead = (globalThis.window?.self.window).Promise;

// dead `?.` chains over VALUE-DEFINED navs erase whole: the sealed ALL-PLAIN nav (declared
// env) and the hop-order spelling (dead optionals over pony-backed reads, deeper window
// reads are realm self-references)
export const viaSealedAllPlain = (globalThis.self.window)?.Array.of(8).at(0);
export const viaHopOrderDead = globalThis.self?.window.self?.Array.of(10).at(0);

// the PLAIN-seal claim / destructure / synth classes inject their statics too (usage-global
// only adds imports; the sealed read stays user-code) - the over-inject-safe verdict
export const viaSealedPlainClaimG = (globalThis.window?.self.window).Array.of(6).at(0);
export const { entries: viaSealedDestructureG } = (globalThis.window?.self.window).Object;
export function viaSealedSynthG({ freeze: gf } = (globalThis.window?.self.window).Object) { return gf; }

// probed-nav destructure forms (the pure flavor renders guards; global only injects) - lock
// the injection sets for the SE-key residual, assignment-host, alias-rooted, and anchored
// pattern-hop shapes
let c9 = 0;
export const { [(c9++, 'getOwnPropertyNames')]: viaProbeSeKeyResidual } = globalThis.window?.self.Object;
export const { [(c9++, 'entries')]: viaSealedSeKeyResidualG } = (globalThis.window?.self).Object;
const gAlias = globalThis;
export const viaAliasSealedClaim = (gAlias.window?.self).Array.of(3);
export const { Object: { [(c9++, 'freeze')]: viaAnchoredSealedSeKey } } = (globalThis.window?.self);
export const { JSON: { stringify: viaAnchoredSealedFull } } = (globalThis.window?.self);
export { c9 };

// full-consume / call-rooted probe shapes: the global flavor keeps the source verbatim and
// must still DETECT through them (injection sets are the lock)
export const { structuredClone: viaFlatBareNavG } = (globalThis.window?.self);
export const [{ Math: { hypot: viaArrayWrappedG } }] = [(globalThis.window?.self)];
const dhG = () => globalThis;
export const { JSON: { parse: viaCallRootG } } = (dhG().window?.self);
let ccG = 0;
const dheG = () => { ccG++; return globalThis; };
export const viaSeCallClaimG = (dheG().window?.self).Array.of(5).at(0);
export { ccG };
