// function declarations are hoisted: a top-level `function Map() {}` shadows the
// global `Map` for the entire module, so all `Map` uses skip polyfilling.
f();
function Array() {}
Array.from([1]);
