// the TS require-import shape of a pure global-this import: `import g = require(...)` binds
// the module default, so a slot write through it must taint exactly like the ESM form
import g = require("@core-js/pure/actual/global-this");
g.Map = Shim;
new Map([[1, 2]]);