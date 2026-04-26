import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// binding via optional chain on a proxy global `self?.Promise`: through the alias,
// subsequent references still resolve to the pure-mode `Promise` polyfill.
const P = _Promise;
_Promise$resolve(1);