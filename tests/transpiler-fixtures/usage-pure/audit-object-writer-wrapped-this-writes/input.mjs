// a TS-cast / satisfies-wrapped FunctionExpression property still binds `this` to the object,
// so its `this.<field> =` writes invalidate the field narrow exactly like the bare form
// (the write RHS is an unresolvable call, so the field widens); a wrapped writer with no
// writes and an arrow writer (OUTER `this`) keep the narrow
const asWrapped = { field: [1, 2], m: (function () { this.field = src(); }) as any };
export const viaAs = (asWrapped.field as any).at(0);

const withSatisfies = { tags: ['x'], m: function () { this.tags = src(); } satisfies CallableFunction };
export const viaSat = (withSatisfies.tags as any).includes('x');

const silent = { keep: [3, 4], m: (function () { return null; }) as any };
export const viaSilent = (silent.keep as any).at(1);

const arrowOnly = { outer: [5], m: (() => { this.outer = src(); }) as any };
export const viaArrow = (arrowOnly.outer as any).at(0);
