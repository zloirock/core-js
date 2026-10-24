// `||` twin of the `??` nullish case: a falsy/nullish `r` yields the RIGHT string operand,
// so the always-truthy fold must not collapse to Array - both operand shapes inject
// (es.array.includes + es.string.includes)
declare const r: number[] | null;
// @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
(r || 'fallback').includes('f');
