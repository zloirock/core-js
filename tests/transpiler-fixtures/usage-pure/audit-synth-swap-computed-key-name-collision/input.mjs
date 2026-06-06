// the plain key `k` and the computed key `[k]` share the Identifier name 'k' but bind different
// slots (`v = Array.k`, `w = Array.of` since k='of'). synth-swap must keep them distinct in its
// per-receiver polyfill map (`synthSwapPropKey` keys computed `[k]` apart from plain `k`), else the
// unpolyfilled plain `k` slot would wrongly pick up the computed key's `_Array$of`
const k = "of";
function f({ k: v, [k]: w } = Array) { return [v, w]; }
f();
