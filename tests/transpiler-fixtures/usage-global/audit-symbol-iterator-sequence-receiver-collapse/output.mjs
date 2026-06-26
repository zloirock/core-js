import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// `[Symbol.iterator]` on a SEQUENCE receiver with a proxy-global tail `(n += 1, globalThis.self)[Symbol.iterator]`.
// the tail proxy hop must collapse to the ROOT `_globalThis` (the prefix SE re-emits through the collapse
// sequence `(n, _root)`) the SAME way both emitters collapse a sequence-tail hop for other dispatch
// (`(n, globalThis.self).Map` -> `(n, _Map)`). before: unplugin CRASHED (the tail's `globalThis.self -> _self`
// rewrite double-composed with the collapsed receiver - "could not locate inner needle"); babel kept a leaf
// `_self` only here. distinct prefix SE + hop depth per line: single hop, deep `.self.window`, a get-call.
let n = 0;
const single = (n += 1, globalThis.self)[Symbol.iterator];
const deep = (n += 10, globalThis.self.window)[Symbol.iterator];
const call = [...(n += 100, globalThis.self)[Symbol.iterator]()];
export { single, deep, call, n };