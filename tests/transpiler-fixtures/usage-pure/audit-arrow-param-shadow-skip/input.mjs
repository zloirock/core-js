// arrow-function parameters shadow globals: shadowed references inside the arrow body
// skip pure-mode polyfill emission.
(Array => Array.from([1]))();
(Promise => new Promise(fn))();
