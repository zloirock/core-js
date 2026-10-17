// a ternary CONSEQUENT delimits a whole expression, so the fold stays BARE there; the right
// operand of `??` looks the same from the source and does NOT - the pair pins which slot the
// consumer actually is
export const ternaryConsequent = 1 ? globalThis.window?.self.Math.sign(-2) : 0;
