// function declarations are hoisted: a top-level `function Array() {}` shadows the
// global `Array` for the entire module, so all `Array` uses skip polyfilling.
f();
function Array() {}
Array.from([1]);
