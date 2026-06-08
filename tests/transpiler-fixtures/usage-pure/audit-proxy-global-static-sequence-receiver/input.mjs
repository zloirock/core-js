// proxy-global static with a SEQUENCE receiver: `(eff(), globalThis.Array).from(...)`. the tail
// `globalThis.Array` is subsumed by the static rewrite (`_Array$from`), so `globalThis` must NOT
// also get its own `_globalThis` polyfill - that parallel rewrite overlaps the static one and
// crashes unplugin's text-transform queue. the SE prefix and its own polyfill survive in order
const log = [];
(log.push("e"), globalThis.Array).from([1, 2]);
