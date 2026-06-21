// negative-control for the IIFE-prefix preservation fix: bare SE-tail receiver
// `(foo(), Promise).resolve(1)` MUST still suppress the inner `Promise` Identifier
// (it sits outside the side-effect subtree, which carries only the preceding `foo()`).
// without suppression the identifier visitor queues a dead `_Promise` import.
declare const foo: () => unknown;
const r = (foo(), Promise).resolve(1);
[r];
