import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a CALL/IIFE-rooted proxy navigation with an UNRESOLVED sibling key (`{ from, length } = (() =>
// globalThis)().self.Array`): the resolved `from` synth-swaps to the polyfill, but the unresolved sibling
// re-reads the receiver - and `maximalProxyGlobalPrefix` / `findProxyGlobal` validate only bare-Identifier
// roots, so the proxy hop `.self` / `.window` stayed verbatim, reading an undefined intermediate off the
// global object off-browser (ie:11 / Node throw); unplugin additionally kept the root `globalThis` raw.
// the shared provider resolves the call root by inlining, so both emitters collapse `<call>.<hop>.Array`
// to `_globalThis.Array` (root substituted, hop dropped). covers self + window hops, distinct statics
function f({
  from,
  length
} = {
  from: _Array$from,
  length: _globalThis.Array.length
}) {
  return [from([1]), length];
}
function g({
  of,
  prototype
} = {
  of: _Array$of,
  prototype: _globalThis.Array.prototype
}) {
  return [of(1), prototype];
}
// an OPTIONAL hop on the leaf (`.self?.Array`): the collapsed root is always-defined, so the redundant
// `?.` is dropped (`_globalThis.Array`), matching babel's non-optional member rebuild
function opt({
  fromAsync,
  name
} = {
  fromAsync: _Array$fromAsync,
  name: _globalThis.Array.name
}) {
  return [fromAsync([1]), name];
}
export { f, g, opt };