import _globalThis from "@core-js/pure/actual/global-this";
// A stored realm remains observable while its proxy hops collapse in pure mode.
// The write owns its source comment; rereading the held receiver must not repeat it.
let held;
(held /* saved realm */ = _globalThis.window, null == held ? null.self : held).Map = 2;
export { held };