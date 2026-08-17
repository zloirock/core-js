import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// an ALL-proxy chain as a destructure SOURCE drops every hop to the root - the receiver value is
// invariant of which global names it. a chain whose VALUE short-circuits is not that invariant:
// dropping the hops answers a defined object where the source destructures undefined and throws.
// what this locks is the SOURCE shape (hops kept vs dropped to `_globalThis`), not an import: the
// drop only fires on a pattern naming nothing polyfillable, so no row here can carry an injection
// - the names are deliberately not method names, or the synth-swap channel would own the pattern.
// the stand-down hands the chain to the short-circuit render, so the hops resolve to their
// ponyfills instead of being read raw off the substituted root - the same render a claim above the
// chain has always reached
export const {
  zzz: viaSealed
} = (null == _globalThis.window ? void 0 : _self).window;
export const {
  zzz: viaOptional
} = null == _globalThis.window ? void 0 : _self.window;
export const [viaArrayPattern] = (null == _globalThis.window ? void 0 : _self).window;

// NEGATIVE: an ALL-PLAIN deep nav carries no short-circuit and keeps collapsing to the root - the
// accepted proxy boundary, where the output answers `undefined` and the source throws off-window
export const {
  zzz: viaPlainDeepNav
} = _globalThis;