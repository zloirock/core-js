// a `...rest` sibling keeps the destructure init in the output (rest needs the source object), so
// the emitter re-substitutes the proxy globals inside that retained logical. when a `??` operand is
// a PARENTHESIZED `||` chain, its wrapping parens are REQUIRED (`??` cannot mix with `||` without
// them) - dropping them on substitution is a syntax error the AST-based twin never produces
const { from, ...rest } = globalThis.Array ?? (globalThis.Set || Map);
const { groupBy, ...others } = globalThis.Map ?? (globalThis.WeakMap || Set);
export { from, rest, groupBy, others };
