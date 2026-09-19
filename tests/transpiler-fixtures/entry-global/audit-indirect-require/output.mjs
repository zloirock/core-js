// webpack-style indirect require `(0, require)('core-js/...')` preserves the pre-ES2015
// "indirect eval" shape that detaches the call from the lexical `require` binding. entry
// detection must peel the comma-expression tail so the call still registers
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.from");
require("core-js/modules/es.string.iterator");