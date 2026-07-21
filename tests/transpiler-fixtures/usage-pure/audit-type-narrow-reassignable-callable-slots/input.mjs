// a callable slot that is observably REASSIGNED loses its declared call-return narrowing:
// the replacement may return a foreign family, and a type-specific helper would throw on it.
// an untouched slot keeps the narrow - the guard is per-slot, not blanket
const reassignedMethod = { pick(): string[] { return ['a']; } };
(reassignedMethod as any).pick = () => 'zz';
export const methodDegraded = reassignedMethod.pick().at(0);
const keptMethod = { pick(): string[] { return ['a']; } };
export const methodNarrowed = keptMethod.pick().at(0);
// the same rule on a class FIELD holding a function
class Swapped {
  pick: () => string[] = () => ['a'];
  swap() { this.pick = (() => 'zz') as any; }
}
declare const swapped: Swapped;
export const fieldDegraded = swapped.pick().at(0);
class Stable {
  pick: () => string[] = () => ['a'];
}
declare const stable: Stable;
export const fieldNarrowed = stable.pick().at(0);
// reading the slot itself still yields a Function whoever wrote it - only the RETURN narrows
export const slotValue = typeof reassignedMethod.pick;
