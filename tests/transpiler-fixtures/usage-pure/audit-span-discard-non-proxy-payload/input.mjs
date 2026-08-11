// an emit that COLLAPSES a receiver replaces source it does not reproduce, so a polyfillable read
// buried in the discarded region has to stand down with it - left queued it composes against text
// that is gone and the build aborts. every discarded-region shape below (effect-free sequence
// prefix, computed-key prefix, sealed probe receiver, dropped IIFE argument) crosses a claim
// channel: static call, symbol key, prototype-navigated instance, destructure, `in`.
function dh(x) { return globalThis; }
function pick(x) { return x; }
function eff() { return 0; }
export const staticCall = (Promise, globalThis).self.Array.of(1);
export const staticRead = globalThis[(Promise, "self")].window.Number.MAX_SAFE_INTEGER;
export const symbolKey = [1, 2][(Promise, globalThis).self.Symbol.iterator];
export const sealedProbe = ((Promise, globalThis).window?.self.window)[Symbol.iterator];
export const instanceChain = globalThis[(Promise, "self")].window?.Array.prototype.includes.call([1], 1);
export const { noSuchStatic } = globalThis[(Promise, "self")].Number;
export const objectPayload = ({ p: Promise }, globalThis).self.Array.of(2);
// a fully-consumed destructure drops its init WHOLE, and the sequence prefix sits under the member
// spine where the top-level peel never reaches it
export const consumedInit = (() => { const { of } = ({ p: Promise }, globalThis).self.Array; return typeof of; })();
export const arrowPayload = (() => Promise.resolve(1), globalThis).self.Array.of(3);
// a PROVEN call root collapses like any other receiver, so its argument is discarded too
export const provenCallArg = (() => globalThis)(Promise).self.Array.of(5);
// the receiver an emit RE-EMITS keeps its own rewrites: a harvested effect rides ahead of the
// binding, so the read inside it still resolves
export const effectPrefix = (eff(), globalThis).self.Array.of(4);
export const foldedIn = "of" in (Promise, globalThis).self.Array;
// a callee that IGNORES its parameter returns the same value for every argument, so the root IS
// proven and the static claims - the argument's own read rides the discarded span, exactly like the
// arrow spelling above. the genuinely opaque row is the one below, whose callee READS its parameter
export const paramIgnoringRoot = dh(Promise).self.Array.of(6);
// negative: an OPAQUE call root proves nothing about its return value, so the static is not claimed
// and the navigation stays exactly as written - only the argument, which survives, is rewritten
export const opaqueRoot = pick(Promise).self.Array.of(7);

// the sequence prefix ahead of a claimed static is re-emitted VERBATIM, so what it reads keeps its
// own rewrite: a bare proxy global there must still come back polyfilled, not raw. every operand
// shape the prefix can take - a global read, a proxy navigation, a pure discard, a real effect.
// these four rows also record an OPEN divergence rather than an agreed shape: the other emitter
// ELIDES an effect-free prefix instead of re-emitting it, which is why its import set here is
// smaller. what the rows assert is the rewrite INSIDE the prefix, not the decision to keep it
export const prefixGlobal = (globalThis, globalThis.self).Map.name;
export const prefixNav = (globalThis.self, globalThis.self).Map.name;
export const prefixDiscard = (0, globalThis).Map.name;
export const prefixEffect = (eff(), globalThis).Map.name;
