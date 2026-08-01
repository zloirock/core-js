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

// PLAIN claims through the sealed root claim receiverless, but the erase re-emits the read
// the source performs on the sealed VALUE as a THROW probe ahead of the claim: an absent
// `window` throws at the probe exactly as the source does, a present one reads through the
// ponyfill and drops the value - call, destructure and the claimable ctor value-use alike
export const viaSealedPlainCall = (globalThis.window?.self.window).Array.of(6).at(0);
export const { at: viaSealedPlainDestructure } = (globalThis.window?.self.window).Array.of(7);
export const viaSealedPlainCtorRead = (globalThis.window?.self.window).Promise;

// the throw probe rides the OTHER sealed erase channels too: the prototype-placement swap
// (only the CTOR sub-receiver swaps, `.prototype` survives) and the static-FALLBACK swap
// (the member itself is not polyfilled; an SE hop key rides the probe exactly once)
export const viaSealedProtoMethod = (globalThis.window?.self.window).Map.prototype.has.call(new Map(), 5);
let c2 = 0;
export const viaSealedFallbackStatic = (globalThis.window?.[(c2++, 'self')]).Promise.noSuchStatic;
export { c2 };

// the probe rides DESTRUCTURE and INSTANCE spellings of the sealed source too: a static
// prop claim carries it in the extracted binding (throw before ANY binding lands), an
// instance receiver renders the guarded nav INSIDE the helper argument
export const { includes: viaSealedDestructure2 } = (globalThis.window?.self.window).Array.prototype;
let c3 = 0;
export const { entries: viaSealedSeKeyDestructure } = (globalThis.window?.[(c3++, 'self')]).Object;
export const viaSealedInstanceCall = (globalThis.window?.self.window).Array.prototype.findIndex.call([8], v => v === 8);
export { c3 };

// the probe rides the PARAM-DEFAULT synth swap too: the sealed read re-emits ahead of the
// synth literal (throw before the default binds; the nav's key SE runs once, on the probe)
export function viaSealedSynthDefault({ getPrototypeOf: sp1 } = (globalThis.window?.self.window).Object) { return sp1; }
let c4 = 0;
export function viaSealedSeKeySynthDefault({ setPrototypeOf: sp2 } = (globalThis.window?.[(c4++, 'self')]).Object) { return sp2; }
export { c4 };

// synth NEGATIVES: an unresolvable prop sibling bails the whole synth (the raw default IS
// the destructure source - its read carries the throw); an empty pattern keeps the
// guard-value render of the source (nothing extracts, the read still probes)
export function viaSealedSynthResidualBail({ groupBy: sn1, customK: sn2 } = (globalThis.window?.self.window).Object) { return [sn1, sn2]; }
export const {} = (globalThis.window?.self.window).Math;

// the probe rides the fallback-LOGICAL and per-branch TERNARY synth spellings through the
// branch the value reads through (the left / the taken branch); a probe-carried key SE
// leaves the rescue channel exactly once
let c5 = 0;
export function viaSealedLogicalSynth({ fromEntries: sl1 } = (globalThis.window?.[(c5++, 'self')]).Object ?? Object) { return sl1; }
let cond1 = true;
export function viaSealedBranchSynth({ assign: sb1 } = cond1 ? (globalThis.window?.self.window).Object : Object) { return sb1; }
export { c5 };

// probe-carrying synth reaches the remaining HOSTS through their own visitors: a for-init
// extracted binding and a class-field IIFE param default (SE-key rides the probe once)
let c6 = 0;
for (const { getOwnPropertySymbols: fh1 } = (globalThis.window?.self.window).Object; c6 < 1; c6++) void fh1;
class SealedHost {
  field = (({ is: fv } = (globalThis.window?.[(c6++, 'self')]).Object) => fv)();
}
export const sealedHost = new SealedHost();
export { c6 };

// probed NEGATIVES locked verbatim: an SE-key sealed receiver with an unresolvable prop
// sibling bails the synth WHOLE (a hybrid would run the key SE twice); a fallback-LOGICAL
// with a non-collapsible right keeps the raw branch pair; a MUTATED `self` slot deopts the
// probe render (the read must observe the user's replacement, raw)
let c7 = 0;
export function viaSealedSeKeyResidualBail({ getOwnPropertyNames: nb1, customK: nb2 } = (globalThis.window?.[(c7++, 'self')]).Object) { return [nb1, nb2]; }
export function viaSealedLogicalRawBail({ seal: nb3 } = (globalThis.window?.self.window).Object || {}) { return nb3; }
export const [] = (globalThis.window?.self.window).Array;
export { c7 };

// ARRAY-pattern and const-alias computed-key destructures ride the probe like the named
// forms; an SE-key residual re-reads the source itself (throw + key SE both live there)
let c8 = 0;
export const [viaSealedArrayPattern] = (globalThis.window?.self.window).Array.of(12);
const aliasKey = 'getOwnPropertyDescriptor';
export const { [aliasKey]: viaSealedAliasKey } = (globalThis.window?.self.window).Object;
export const { [(c8++, 'defineProperty')]: viaSealedSeKeyResidual } = (globalThis.window?.self.window).Object;
export { c8 };

// dead `?.` chains over VALUE-DEFINED navs erase whole: the sealed ALL-PLAIN nav (declared
// env) and the hop-order spelling (dead optionals over pony-backed reads, deeper window
// reads are realm self-references)
export const viaSealedAllPlain = (globalThis.self.window)?.Array.of(8).at(0);
export const viaHopOrderDead = globalThis.self?.window.self?.Array.of(10).at(0);

// SE-key residual variants: a LIVE `?.` probe rides the guard with an optionalized tail
// (short-circuit preserved), a claimable CTOR leaf keeps the plain read above the seal
// (the residual claims nothing), a DEFINED hop nav keeps its plain collapse (no guard)
let c9 = 0;
export const { [(c9++, 'getOwnPropertyNames')]: viaProbeSeKeyResidual } = globalThis.window?.self.Object;
export const { [(c9++, 'from')]: viaSealedCtorLeafResidual } = (globalThis.window?.self).Array;
export const { [(c9++, 'isArray')]: viaDefinedHopSeKeyResidual } = globalThis.self.Array;
export { c9 };

// ASSIGNMENT-host SE-key destructures keep the whole pattern in place (no declaration to
// split) - the kept init rides the same guard canon as the declarator residual
let ca = 0;
let viaSealedAssignSeKey;
({ [(ca++, 'entries')]: viaSealedAssignSeKey } = (globalThis.window?.self).Object);
let viaProbeAssignSeKey;
({ [(ca++, 'keys')]: viaProbeAssignSeKey } = globalThis.window?.self.Object);
export { viaSealedAssignSeKey, viaProbeAssignSeKey, ca };

// ALIAS-rooted probe navs ride the same canon with the alias identifier kept verbatim in
// the guard test; a DEFINED alias nav keeps the hop-drop / ctor-swap collapses
const gAlias = globalThis;
let cb = 0;
export const viaAliasKeptSealed = (gAlias.window?.self).Object;
export const viaAliasKeptLive = gAlias.window?.self.Object;
export const viaAliasSealedClaim = (gAlias.window?.self).Array.of(3);
export const { [(cb++, 'values')]: viaAliasSealedSeKey } = (gAlias.window?.self).Object;
export const viaAliasDefinedHopDrop = gAlias.self.Object;
export const viaAliasDefinedCtorSwap = (cb++, gAlias).self.Map;
export { cb };

// an SE computed KEY combined with an SE CALL root in ONE sealed probe: the guard test owns
// the single call run, the alternate owns the single key run (native order test-key-read)
let cc1 = 0, kc1 = 0;
const dheCombo = () => { cc1++; return globalThis; };
export const viaSeKeySeCallRoot = (dheCombo().window?.[(kc1++, 'self')]).Array.of(5).at(0);
export { cc1, kc1 };
