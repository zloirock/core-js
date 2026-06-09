// a side-effecting computed key resolving to an INSTANCE method (`flat`). the polyfill `_flat(arr)`
// needs the receiver, which the residual destructure preserves, so the effect is NOT lifted out - the
// key stays in the residual pattern (value -> throwaway, native value read+discarded) while
// `const m = _flatMaybeArray(arr)` is extracted before it. regression: the effect was dropped (babel) /
// nothing was emitted (unplugin). receiver must be a plain Identifier - re-referenced by the extraction
const { [(effectful(), 'flat')]: m } = arr;
const probe = [1, 2].includes(2);
