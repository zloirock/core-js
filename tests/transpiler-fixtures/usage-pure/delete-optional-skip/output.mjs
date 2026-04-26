import _globalThis from "@core-js/pure/actual/global-this";
// `Promise` in `delete x.Promise` operand position is preserved verbatim - replacing it
// with `_Promise` would emit invalid `delete _Promise`. Receiver `globalThis` is still
// polyfilled normally.
delete _globalThis.Promise;