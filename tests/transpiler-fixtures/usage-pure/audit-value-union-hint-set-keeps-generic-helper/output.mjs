import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a receiver whose reachable values span two dispatching families names both: the global flavor then
// injects exactly those two, but a pure HELPER is a single function and a type-specific one throws
// when handed the other family - so a hint set broader than any one variant must keep the GENERIC
// helper. the single-family row is the control that still earns its type-specific one
let union = "s";
const readUnion = () => _includes(union).call(union, 1);
union = [];
export const a = readUnion();
let single = null;
const readSingle = () => _atMaybeArray(single).call(single, 0);
single = [];
export const b = readSingle();