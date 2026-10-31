import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// binding via TS `as` cast on a proxy global: the cast is peeled and the alias
// still resolves to the pure-mode polyfill on subsequent references.
const P = _Promise;
_Promise$resolve(1);