// IIFE wrapping an async generator: the generator body is scanned and runtime calls
// inside it (e.g. `yield Map.x`) are rewritten as usual.
let x = [1, 2, 3];
(async function*() { x = 'hello'; })();
x.at(0);
