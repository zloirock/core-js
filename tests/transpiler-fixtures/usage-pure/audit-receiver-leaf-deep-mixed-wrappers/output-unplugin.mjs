import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// unwrapReceiverLeaf depth: parens + TS-as + IIFE + parens + TS-as nest deeply.
// Helper iterates unwrapInitValue / unwrapRuntimeExpr alternating with peelIIFEReturn
// up to 64 depth. After full peel the receiver leaf should be the inner Identifier
// `arr`. Confirms the loop converges (no infinite regression) and that emit
// suppression sees the same leaf as receiver-name resolution.
const arr = [10, 20, 30];
const wrapped = (((((() => (((arr as any))))) as any)()) as any);
_atMaybeArray(wrapped).call(wrapped, 0);