// IIFE wrapping an async generator: the generator body is scanned (the `x = 'hello'` write widens
// the binding's type) and the outer `x.at(0)` still earns its instance polyfill as usual.
let x = [1, 2, 3];
(async function*() { x = 'hello'; })();
x.at(0);
