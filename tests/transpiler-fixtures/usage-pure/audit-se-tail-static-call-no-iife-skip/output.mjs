import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// negative-control for the IIFE-prefix preservation fix: bare SE-tail receiver
// `(foo(), Promise).resolve(1)` MUST still suppress the inner `Promise` Identifier
// (it sits outside any sideEffects subtree - sideEffects only carries the preceding
// `foo()` call). Without suppression the identifier visitor would queue a dead
// `_Promise` import (substring `Promise` inside `_Promise$resolve` doesn't match the
// inner needle, but the import allocation still fires).
declare const foo: () => unknown;
const r = (foo(), _Promise$resolve)(1);
[r];