// a conditionally-bound key alias does not dominate the write, so the resolver cannot prove
// `Array[key]` is `Array.from` and leaves the later call substitutable - usage-pure keeps the
// polyfill rather than risk dropping it on an engine that needs it (bail-safe direction)
const flag = Date.now() % 2;
if (flag) var key = "from";
Array[key] = function () { return []; };
Array.from([1, 2, 3]);
