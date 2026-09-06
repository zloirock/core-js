// A TOP-LEVEL `function require` is a real binding in every host - no parameter carve-out reaches
// it - so the call below is the author's own function and the entry stays where they wrote it.
// The pair to the block-scoped one, which the wrapper's parameter list blocks from hoisting.
function require() {}
require("core-js/es/array/includes");
module.exports = 1;