import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// `[Symbol.iterator]` on a SEQUENCE receiver with a proxy-global tail `(n += 1, globalThis.self)[Symbol.iterator]`.
// the tail proxy hop must collapse to the ROOT `_globalThis` (the prefix SE re-emits through the collapse
// sequence `(n, _root)`) the SAME way both emitters collapse a sequence-tail hop for other dispatch
// (`(n, globalThis.self).Map` -> `(n, _Map)`). before: unplugin CRASHED (the tail's `globalThis.self -> _self`
// rewrite double-composed with the collapsed receiver - "could not locate inner needle"); babel kept a leaf
// `_self` only here. distinct prefix SE + hop depth per line: single hop, deep `.self.window`, a get-call.
let n = 0;
const single = _getIteratorMethod((n += 1, _globalThis));
const deep = _getIteratorMethod((n += 10, _globalThis));
const call = [..._getIterator((n += 100, _globalThis))];
export { single, deep, call, n };