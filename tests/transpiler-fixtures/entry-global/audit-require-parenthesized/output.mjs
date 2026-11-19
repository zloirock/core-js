// outer paren `(require('core-js/...'))` with preserved parenthesized wrapper -
// the entry resolver now unwraps the wrapper so the require call surfaces
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.from");
require("core-js/modules/es.string.iterator");