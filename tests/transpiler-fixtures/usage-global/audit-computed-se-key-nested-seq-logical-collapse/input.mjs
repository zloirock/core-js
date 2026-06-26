// usage-global counterpart: detection must resolve each array-method polyfill THROUGH the nested-sequence,
// SE-bearing computed-key proxy operand and inject the side-effect import, keeping the source verbatim (no
// collapse in the global flavor). the multi-type methods (includes, at) on a bare declarator / assignment
// inject ONLY the array module (not the string module) - the receiver-type inference resolves through the SE
// computed key to a single concrete Array.prototype. the logical hosts (||, &&) carry ARRAY-ONLY methods
// (flat, findLast): a logical's receiver is a union, on which a multi-type method would over-inject the other
// variant, so array-only methods inject only their array module while still exercising the verbatim path.
let a = 0, b = 0, c = 0, d = 0, e = 0, x;
const { flat } = (c++, (d++, globalThis))[(e++, 'self')].Array.prototype || {};
const { findLast } = (c++, globalThis)[(e++, 'self')].Array.prototype && {};
const { includes } = (a++, (b++, globalThis))[(c++, 'self')].Array.prototype;
({ at: x } = (c++, globalThis)[(e++, 'self')].Array.prototype);
export { flat, findLast, includes, x, a, b, c, d, e };
