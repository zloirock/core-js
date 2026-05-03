import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// peelIIFEReturn accepts OptionalCallExpression: `(() => arr)?.()` is shape-equivalent
// to `(() => arr)()` for receiver-leaf walks (the OPTIONAL chain only matters at
// runtime when callee is null/undef; here callee is a literal arrow so the call
// always fires). Confirms unwrapReceiverLeaf peels through the optional-call IIFE.
const arr = [1, 2, 3];
const peeled = (() => arr)?.();
_atMaybeArray(peeled).call(peeled, 0);