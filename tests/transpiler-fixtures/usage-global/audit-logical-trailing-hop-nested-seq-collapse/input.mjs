// usage-global counterpart: detection must resolve each array-method polyfill THROUGH the logical-wrapped,
// nested-sequence, trailing-hop proxy operand and inject the side-effect import, keeping the source verbatim
// (no collapse in the global flavor). a regression-guard that the deep wrapper does not hide the method.
// the `&&` line is the statically-dead exception: its always-truthy left narrows the value to the `{}`
// right, so its method module is NOT injected.
let a = 0, b = 0, c = 0, d = 0;
const { flat } = (c++, (d++, globalThis.self)).window.Array.prototype || {};
const { at } = (c++, (d++, globalThis.self)).window.Array.prototype && {};
const { includes } = (a++, (b++, (c++, globalThis.self))).self.window.Array.prototype || {};
const { map } = (d++, globalThis.self).Array.prototype || {};
export { flat, at, includes, map, a, b, c, d };
