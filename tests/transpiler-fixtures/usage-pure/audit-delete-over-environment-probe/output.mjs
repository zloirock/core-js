import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the `delete` canon and its one exception. a `delete` consumer reads nothing over its
// navigation, so the hops fold with their guards - EXCEPT where a live `?.` guards the
// ENVIRONMENT PROBE itself. That guard is not over a read: it decides whether the delete
// HAPPENS, and folding it removes a slot off the ponyfill the source never touches (measured on
// a realm with no `window`: the source leaves `globalThis.chrome` alone, the folded spelling
// deletes it). the kept guard puts the deleted member OUTSIDE the ternary behind a `?.` of its
// own - pulled into the alternate the ternary evaluates and deletes nothing, and left outside
// bare it reads off the guard's `void 0`. a `?.` over a hop pure CAN spell (`self`) reads an
// always-defined ponyfill and folds with the rest, seals included.
_globalThis.chrome = {
  probeSlot: 1
};
_globalThis.deleteBox = {
  slot: 1,
  nested: {
    slot: 2
  }
};
const ut = () => _globalThis;
// KEPT: the `?.` guards the `window` probe read
export const probeGuarded = delete (null == ut().window ? void 0 : _self)?.chrome;
// ... and the tail rides outside behind a `?.` the source never spelled
export const probeGuardedPlainTail = delete (null == ut().window ? void 0 : _self)?.deleteBox;
export const probeGuardedDeepTail = delete (null == ut().window ? void 0 : _self)?.deleteBox.nested.slot;
// FOLDED: the `?.` is over `self`, a hop the pure package spells - always defined after the swap
export const resolvableHopFolds = delete _globalThis.Promise;
// FOLDED: a seal ends the chain, and that family accepts the divergence
export const sealedFolds = delete _globalThis.deleteBox;