import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _self from "@core-js/pure/actual/self";
// when the split receiver keeps a PROVEN chain above its memo, the chain's first key may still name
// a polyfilled constructor - it must be spelled from the pure import, not read off the memo. read
// raw (`_ref.Promise[k]`) it asks the ponyfill root for a slot no host without the built-in has,
// and the entry that would have supplied it never gets imported. the plain static below keeps no
// chain and is the negative half
let v, g, out, k;
function eff() {}
out = null == (g = _globalThis, v = null == g[eff(), 'window'] ? void 0 : _self) ? void 0 : _nameMaybeFunction(_at(_Promise[k]));
export const read = out;
export const race = null == (g = _globalThis, v = null == g[eff(), 'window'] ? void 0 : _self) ? void 0 : _Promise$race([]);