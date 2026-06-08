import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// proxy-global static with a SEQUENCE receiver: `(eff(), globalThis.Array).from(...)`. the tail
// `globalThis.Array` is subsumed by the static rewrite (`_Array$from`), so `globalThis` must NOT
// also get its own `_globalThis` polyfill - that parallel rewrite overlaps the static one and
// crashes unplugin's text-transform queue. the SE prefix and its own polyfill survive in order
const log = [];
(_pushMaybeArray(log).call(log, "e"), _Array$from)([1, 2]);