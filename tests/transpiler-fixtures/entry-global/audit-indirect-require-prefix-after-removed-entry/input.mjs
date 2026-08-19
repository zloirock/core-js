// a removed entry sits right between a `;`-less statement and an indirect-require entry whose
// kept prefix starts on `(`: the two rewrites share one seam, and the `;` that separates
// `var x = obj` from `(0, spy)()` has to survive whichever of them is written first - without it
// the two statements fuse into the call `obj(0, spy)()`. the outer-sequence spelling is the same seam
function spy() {}
var x = obj
import 'core-js/actual/array/from'
((0, spy)(), require)('core-js/actual/array/of')
var y = obj
import 'core-js/actual/array/at'
0, ((0, spy)(), require)('core-js/actual/array/flat')
