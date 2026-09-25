// A selection arm that CALLS a named function reads what that function returns to every caller, so no
// mirror is written into its body: the call still runs, and the realm it returns is mirrored beside
// it. An inline IIFE returning a static alias is always truthy: the fallback beside it is dead, and
// so is the mirror it would owe - the read takes the identity guard the container itself would.
function realm() { return globalThis; }
const { Math: { trunc: viaNamed } } = realm() || globalThis;
const other = realm().Math.sign(-1);
const box = { Math };
const { Math: { cbrt: viaIife } } = (() => box)() || globalThis;
export { viaNamed, other, viaIife };
