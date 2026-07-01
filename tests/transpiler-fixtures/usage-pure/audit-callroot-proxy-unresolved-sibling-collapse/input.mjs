// a CALL/IIFE-rooted proxy navigation with an UNRESOLVED sibling key (`{ from, length } = (() =>
// globalThis)().self.Array`): the resolved `from` synth-swaps to the polyfill, but the unresolved sibling
// re-reads the receiver - and the proxy-global prefix/root validation accepts only bare-Identifier
// roots, so the proxy hop `.self` / `.window` stayed verbatim, reading an undefined intermediate off the
// global object off-browser (ie:11 / Node throw); unplugin additionally kept the root `globalThis` raw.
// the shared provider resolves the call root by inlining, so both emitters collapse `<call>.<hop>.Array`
// to `_globalThis.Array` (root substituted, hop dropped). covers self + window hops, distinct statics
function f({ from, length } = (() => globalThis)().self.Array) {
  return [from([1]), length];
}
function g({ of, prototype } = (() => globalThis)().window.Array) {
  return [of(1), prototype];
}
// an OPTIONAL hop on the leaf (`.self?.Array`): the collapsed root is always-defined, so the redundant
// `?.` is dropped (`_globalThis.Array`), matching babel's non-optional member rebuild
function opt({ fromAsync, name } = (() => globalThis)().self?.Array) {
  return [fromAsync([1]), name];
}
export { f, g, opt };
