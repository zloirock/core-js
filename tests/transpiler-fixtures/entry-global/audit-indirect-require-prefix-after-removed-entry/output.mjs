require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.at");
require("core-js/modules/es.array.flat");
require("core-js/modules/es.array.from");
require("core-js/modules/es.array.of");
require("core-js/modules/es.array.species");
require("core-js/modules/es.array.unscopables.flat");
require("core-js/modules/es.string.iterator");
// a removed entry sits right between a `;`-less statement and an indirect-require entry whose
// kept prefix starts on `(`: the two rewrites share one seam, and the `;` that separates
// `var x = obj` from `(0, spy)()` has to survive whichever of them is written first - without it
// the two statements fuse into the call `obj(0, spy)()`. the outer-sequence spelling is the same seam
function spy() {}
var x = obj;
(0, spy)();
var y = obj;
(0, spy)();