import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// `||` twin of the `??` nullish case: a falsy/nullish `r` yields the RIGHT string operand,
// so the always-truthy fold must not collapse to Array - both operand shapes inject
// (es.array.includes + es.string.includes)
declare const r: number[] | null;
(r || 'fallback').includes('f');