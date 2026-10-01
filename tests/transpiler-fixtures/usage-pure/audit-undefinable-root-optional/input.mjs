// the ROOT of a run can itself be absent - an alias holding a probe read, an alias holding a
// rendered guard, a bare probe name - and the `?.` over it tests the root: the hops above fold
// onto the deepest backed span under that one test, whether the read is a static, a value or a
// memoized instance chain. read as a proven realm root, the plan called everything below the leaf
// droppable and the value canon's defined branch called the guard alias always-defined
const probeAlias = globalThis.window;
export const probeStatic = probeAlias?.self?.window.Array.of(1);
export const probeValue = typeof probeAlias?.self.Array;
export const probeCustom = probeAlias?.self.customSlot;
export const probeChain = probeAlias?.self?.window.Array.of(1).at(0);

const guardAlias = globalThis.window?.self;
export const guardStatic = guardAlias?.self.Array.of(1);
export const guardValue = typeof guardAlias?.self.Array;
export const guardSealed = (guardAlias?.self).customSlot;
export const guardChain = guardAlias?.self?.window.Array.of(1).at(0);

export const bareStatic = window?.self?.window.Array.of(1);
export const bareChain = window?.self?.window.Array.of(1).at(0);

// the instance split over a constructor leaf asks the same value question: a live `?.` over the
// probe-holding root short-circuits with every hop above it backed
export const probeCtorLeaf = probeAlias?.self?.WeakSet.name;
