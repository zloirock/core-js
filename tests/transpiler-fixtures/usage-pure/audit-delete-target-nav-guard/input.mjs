// a `delete` consumer over a proxy nav COLLAPSES THE NAVIGATION WHOLE: the member it names is never
// READ, so no `?.` over the nav is load-bearing and no probe guard is built - the slot is reached off
// the ponyfill, exactly as every other read in this flavor is. the collapse and the injection run UP
// TO the deleted member; the member itself is never polyfilled.
// an INVOKED claim is not a delete TARGET at all (the operand is a call, no reference either way), so
// it keeps neither the source tail nor the raw stand-down a leading effect otherwise earns - spelling
// both cost first a doubled invocation, then the polyfill entirely.
// one constructor per role: a deleted slot reads as MUTATED file-wide and cancels its own ponyfill.
// the memoized instance tail carries a sidecar: the run under a dispatch is an ordinary READ, so
// babel lands it on the deepest hop pure can back (`_self.Array`), while unplugin settles its
// delete-fold verdict before the dispatch is visible and lands the run's root (`_globalThis.Array`).
// both spell the same realm object - the divergence is which binding names it, not what it reads.
let n = 0;
function dhRoot() { return globalThis; }
export const guardedTarget = delete (globalThis.window.self?.Promise);
export const guardedTargetSealed = delete ((globalThis.window).self?.Promise);
export const invokedClaim = delete ((globalThis.window).self?.Array?.of(5));
export const invokedClaimSeq = delete (((n++, globalThis.window)).self?.Array?.of(6));
export const invokedStaticSeq = delete (((n++, globalThis.window)).self?.Object?.fromEntries([]));
// the deleted member sits on a ctor with NO pure entry: the collapse and the injection run UP TO it
// (`_globalThis.Array.prototype`) and the member itself stays native - it is deleted, never read
export const protoMethodTarget = delete (globalThis.window.self?.Array?.prototype.flat);
export const protoMethodPlain = delete (globalThis.self.Array.prototype.flat);
// a SEQUENCE-rooted nav whose tail is an INSTANCE dispatch: no claim owns it (the deleted member is
// never read), so without its own channel the nav rides raw and throws off-window
export const seqRootInstanceTail = delete (((n++, globalThis.window)).self?.Array?.prototype.flat);
// the DELETED member is the operand, so it is never READ and never polyfilled - the members BELOW it
// are read on the way there and keep their claims. swapped, the operand became a CALL and the delete
// stopped deleting anything at all
export const deletedInstanceMember = delete (globalThis.self.Array.prototype.flat.name);
// an INSTANCE dispatch under the delete memoizes its receiver: that memo holds the COLLAPSED value too,
// so the `_ref` never reads `window` off the ponyfill. with a tail above it the canon lands on the ROOT
export const instanceTailMemo = delete (globalThis.window.self?.Array?.prototype.flat.name);
// the SAME shape off a proven CALL root: the operator names a slot on what the dispatch returned,
// so the run under it is an ordinary read and lands the deepest hop pure can back - the answer may
// not swap with the root kind (it did: an identifier root rode `_self`, a call root the root pony)
export const callRootDispatchTail = delete (dhRoot().self.Array.prototype.flat.customQ);
export const callRootRunSlot = delete dhRoot().self.customQ;
// a CLAIMABLE constructor read off the nav (`Symbol` is read, only `iterator` is deleted) keeps its own
// swap: the nav-collapse channel may not claim a span that swallows it, or the ctor goes out NATIVE -
// undefined in a stripped realm, where the ponyfill is the whole point
export const claimAboveSeqNav = delete (((n++, globalThis.window)).self?.Symbol?.iterator);
// NEGATIVE: no environment probe under the `?.` - the connector is dead and the nav collapses plain
export const noProbe = delete (globalThis.self?.WeakSet);
// NEGATIVE: no `?.` at all - the whole navigation erases and the slot reads off the pure root
export const noOptional = delete (globalThis.window.self.WeakMap);
