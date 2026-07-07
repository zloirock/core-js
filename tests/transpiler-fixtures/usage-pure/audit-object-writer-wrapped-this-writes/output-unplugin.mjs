import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// a TS-cast / satisfies-wrapped FunctionExpression property still binds `this` to the object,
// so its `this.<field> =` writes invalidate the field narrow exactly like the bare form
// (the write RHS is an unresolvable call, so the field widens); a wrapped writer with no
// writes and an arrow writer (OUTER `this`) keep the narrow
const asWrapped = { field: [1, 2], m: (function () { this.field = src(); }) as any };
export const viaAs = _at(_ref = asWrapped.field as any).call(_ref, 0);

const withSatisfies = { tags: ['x'], m: function () { this.tags = src(); } satisfies CallableFunction };
export const viaSat = _includes(_ref2 = withSatisfies.tags as any).call(_ref2, 'x');

const silent = { keep: [3, 4], m: (function () { return null; }) as any };
export const viaSilent = _atMaybeArray(_ref3 = silent.keep as any).call(_ref3, 1);

const arrowOnly = { outer: [5], m: (() => { this.outer = src(); }) as any };
export const viaArrow = _atMaybeArray(_ref4 = arrowOnly.outer as any).call(_ref4, 0);