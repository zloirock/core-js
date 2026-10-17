import _globalThis from "@core-js/pure/actual/global-this";
import _Math$sign from "@core-js/pure/actual/math/sign";
// a ternary CONSEQUENT delimits a whole expression, so the fold stays BARE there; the right
// operand of `??` looks the same from the source and does NOT - the pair pins which slot the
// consumer actually is
export const ternaryConsequent = 1 ? null == _globalThis.window ? void 0 : _Math$sign(-2) : 0;