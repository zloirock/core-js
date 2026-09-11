import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// a callable slot that is observably REASSIGNED loses its declared call-return narrowing:
// the replacement may return a foreign family, and a type-specific helper would throw on it.
// an untouched slot keeps the narrow - the guard is per-slot, not blanket
const reassignedMethod = {
  pick(): string[] {
    return ['a'];
  }
};
(reassignedMethod as any).pick = () => 'zz';
export const methodDegraded = _at(_ref = reassignedMethod.pick()).call(_ref, 0);
const keptMethod = {
  pick(): string[] {
    return ['a'];
  }
};
export const methodNarrowed = _atMaybeArray(_ref2 = keptMethod.pick()).call(_ref2, 0);
// the same rule on a class FIELD holding a function
class Swapped {
  pick: () => string[] = () => ['a'];
  swap() {
    this.pick = (() => 'zz') as any;
  }
}
declare const swapped: Swapped;
export const fieldDegraded = _at(_ref3 = swapped.pick()).call(_ref3, 0);
class Stable {
  pick: () => string[] = () => ['a'];
}
declare const stable: Stable;
export const fieldNarrowed = _atMaybeArray(_ref4 = stable.pick()).call(_ref4, 0);
// reading the slot itself still yields a Function whoever wrote it - only the RETURN narrows
export const slotValue = typeof reassignedMethod.pick;