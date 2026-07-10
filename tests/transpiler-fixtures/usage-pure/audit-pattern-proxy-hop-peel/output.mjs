import _globalThis from "@core-js/pure/actual/global-this";
// a destructure pattern hop that is itself a proxy-global alias binds nothing: it peels like
// the member-chain prefix walk (`globalThis.self.x` -> `_globalThis.x`), anchoring the remaining
// pattern on the receiver's own always-defined binding - a leaf-less residual left verbatim
// reads the raw hop off the pure root (undefined off-engine -> destructure TypeError). deeper
// hops peel iteratively; a namespace below the hop anchors as the member read; a hop default is
// dead under the collapse contract (the hop is always defined post-rewrite) and drops with the
// hop. a REST below the hop keeps the raw residual (rest gathers the hop's other keys); a
// slot-mutated hop keeps the raw residual (the user patch must stay visible).
let a1, a2, a3, a4, a5;
({
  a1
} = _globalThis);
({
  a2
} = _globalThis);
({
  PI: a3
} = _globalThis.Math);
({
  a4
} = _globalThis);
({
  a5
} = _globalThis);
let out;
for (const {
  keys
} = _globalThis; !out;) out = typeof keys;
let rest;
({
  self: {
    ...rest
  }
} = _globalThis);
export { a1, a2, a3, a4, a5, out, rest };