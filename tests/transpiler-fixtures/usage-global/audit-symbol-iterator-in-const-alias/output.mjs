import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `Symbol.iterator in <array>` reached through a const alias of Symbol. The alias resolves
// to the Symbol global, triggering the iterator-protocol polyfill suite identically on both
// plugins. parity counterpart to the bare `Symbol.iterator in []` fixture.
const S = Symbol;
S.iterator in [];