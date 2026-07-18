// the require-style twin of the import-bound proxy slot write: `var g = require(...)` of a
// pure global-this entry taints through the same source canon
var g = require("@core-js/pure/actual/global-this");
g.Map = Shim;
new Map([[1, 2]]);
