// `Symbol.iterator in <array>` reached through a const alias of Symbol. The alias resolves
// to the Symbol global, triggering the iterator-protocol polyfill suite identically on both
// plugins. parity counterpart to the bare `Symbol.iterator in []` fixture.
const S = Symbol;
S.iterator in [];
