// A folded guard tail ends in a bare ternary, the loosest expression there is: an OPERAND slot on either side of an operator
// swallows it, so the fold owes that consumer its parens.
export const eqRight = 1 === globalThis.window?.self.Array.of(1).at(0);
