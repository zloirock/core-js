import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// TS wrappers across the probe nav: a BARE wrapper (`!`, an unparenthesized cast position)
// erases without breaking the chain - the short-circuit survives and the value canon renders
// the guarded ponyfill; a PARENTHESIZED layer seals - the member above it parses PLAIN and
// the render keeps the source's throw semantics. distinct methods per line
let c = 0;
export const bareNonNullHop = null == _globalThis.window ? void 0 : (c++, _self).Number;
export { c };