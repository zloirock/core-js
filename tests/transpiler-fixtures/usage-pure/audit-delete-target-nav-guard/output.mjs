import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
var _ref;
// a `delete` consumer over a proxy nav COLLAPSES THE NAVIGATION WHOLE: the member it names is never
// READ, so no `?.` over the nav is load-bearing and no probe guard is built - the slot is reached off
// the ponyfill, exactly as every other read in this flavor is. the collapse and the injection run UP
// TO the deleted member; the member itself is never polyfilled.
// an INVOKED claim is not a delete TARGET at all (the operand is a call, no reference either way), so
// it keeps neither the source tail nor the raw stand-down a leading effect otherwise earns - spelling
// both cost first a doubled invocation, then the polyfill entirely.
// one constructor per role: a deleted slot reads as MUTATED file-wide and cancels its own ponyfill.
let n = 0;
export const guardedTarget = delete _globalThis.Promise;
export const guardedTargetSealed = delete _globalThis.Promise;
export const invokedClaim = delete _Array$of(5);
export const invokedClaimSeq = delete (n++, _Array$of)(6);
export const invokedStaticSeq = delete (n++, _Object$fromEntries)([]);
// the deleted member sits on a ctor with NO pure entry: the collapse and the injection run UP TO it
// (`_globalThis.Array.prototype`) and the member itself stays native - it is deleted, never read
export const protoMethodTarget = delete _globalThis.Array?.prototype.flat;
export const protoMethodPlain = delete _globalThis.Array.prototype.flat;
// a SEQUENCE-rooted nav whose tail is an INSTANCE dispatch: no claim owns it (the deleted member is
// never read), so without its own channel the nav rides raw and throws off-window
export const seqRootInstanceTail = delete (n++, _globalThis).Array?.prototype.flat;
// the DELETED member is the operand, so it is never READ and never polyfilled - the members BELOW it
// are read on the way there and keep their claims. swapped, the operand became a CALL and the delete
// stopped deleting anything at all
export const deletedInstanceMember = delete _flatMaybeArray(_globalThis.Array.prototype).name;
// an INSTANCE dispatch under the delete memoizes its receiver: that memo holds the COLLAPSED value too,
// so the `_ref` never reads `window` off the ponyfill. with a tail above it the canon lands on the ROOT
export const instanceTailMemo = delete (null == (_ref = _globalThis.Array) ? void 0 : _flatMaybeArray(_ref.prototype).name);
// a CLAIMABLE constructor read off the nav (`Symbol` is read, only `iterator` is deleted) keeps its own
// swap: the nav-collapse channel may not claim a span that swallows it, or the ctor goes out NATIVE -
// undefined in a stripped realm, where the ponyfill is the whole point
export const claimAboveSeqNav = delete (n++, _Symbol).iterator;
// NEGATIVE: no environment probe under the `?.` - the connector is dead and the nav collapses plain
export const noProbe = delete _globalThis.WeakSet;
// NEGATIVE: no `?.` at all - the whole navigation erases and the slot reads off the pure root
export const noOptional = delete _globalThis.WeakMap;