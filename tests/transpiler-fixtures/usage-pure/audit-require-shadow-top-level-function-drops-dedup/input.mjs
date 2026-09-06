// A TOP-LEVEL binding is a real shadow in every host, so the alias below holds the AUTHOR's value
// and not the polyfill - so the second read must mint its own import rather than dedup onto it.
function require() {}
const F = require("@core-js/pure/actual/array/from");
module.exports = [F, Array.from(y)];
