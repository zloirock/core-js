require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.from");
require("core-js/modules/es.array.includes");
require("core-js/modules/es.string.iterator");
// Each indirect require runs after its own prefix. The usage pass must also visit
// the prefix of an optional or nested call, so arr.includes gets its polyfill.
let loads = 0;
loads++;
require("core-js/modules/es.array.from");
let arr = [1];
arr.includes(1);
require("core-js/modules/es.array.includes");
let opt = 0;
opt++;
require?.("core-js/modules/es.array.from");
let outer = 0;
outer++;
require("core-js/modules/es.array.of");
Array.from([1]);