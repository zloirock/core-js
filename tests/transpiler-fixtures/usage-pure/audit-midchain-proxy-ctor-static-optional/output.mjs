import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2;
// optional chaining on a proxy-global ctor-static consumed mid-chain by a plain property then an instance
// method (`globalThis.Map?.list.at(0)`): the `?.` guards the ctor, which the polyfill makes ALWAYS-DEFINED,
// so the optional is dead. babel's AST path flattens it away (`_Map.list`); unplugin's text path defers the
// mid-chain collapse to the natural visitor (the ctor-static rewrite must compose INSIDE the receiver), and
// that visitor preserves the source `?.` (`_Map?.list`). runtime-equivalent - the polyfill never short-
// circuits - so this is a cosmetic babel-optimizes / unplugin-preserves divergence (output-unplugin.mjs
// sidecar). a `.name`-style collapsing hop subsumes the `?.` (no divergence); a DOWNSTREAM optional
// (`?.list?.at`) makes both keep the guard and match. covers direct root and an aliased proxy-global root
let g = _globalThis;
export const a = _at(_ref = _Map.list).call(_ref, 0);
export const b = _flatMaybeArray(_ref2 = _Set.foo).call(_ref2);