// A claim resolving to an INSTANCE helper re-emits its receiver as the helper's ARGUMENT, so the
// proxy global at the bottom of that receiver is still a live read. The detection answered "does
// this render subsume the receiver" from the key's PLACEMENT instead - and `Array.name` is a static
// placement resolving to `function/instance/name` - so it marked that global handled and left a raw
// `globalThis` standing inside the guard test: a ReferenceError on the ie:11 floor this flavor
// exists for. Both roots the marking reaches this way are here - a SEQUENCE below the hop, and an
// inline-resolvable CALL the guard memoizes one hop down.
// NEGATIVES: the same navs read by a STATIC claim, whose import is receiver-LESS and does subsume
// the chain, and the plain-rooted twin no sequence or call hid from the identifier visitor.
// `usage-global` rewrites no source here and injects the same entries whichever way the claim
// routes, so a twin there would be green either way.
let seq = 0;
export const sequenceRoot = (seq++, globalThis).window?.window.Array.name;
export const callRoot = (() => globalThis)().window?.window.Array.name;
export const staticConsumer = (seq++, globalThis).window?.window.Array.from([1]);
export const plainRoot = globalThis.window?.window.Array.name;
export { seq };
