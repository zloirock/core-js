import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// the SE-key trailing pair lands immediately AFTER its consumed declarator: a later declarator
// of the SAME declaration reads the extracted binding and must see the polyfill, not the
// hoisted-undefined pre-init value
const log = [];
const arr = [1, [2]];
var {
    [(_pushMaybeArray(log).call(log, 1), 'flat')]: _unused
  } = arr,
  flat = _flatMaybeArray(arr),
  viaFlat = flat;
// export host: the pair joins the exported declaration at the same slot
export var {
    [(_pushMaybeArray(log).call(log, 2), 'at')]: _unused2
  } = arr,
  at = _atMaybeArray(arr),
  viaAt = at;
// rest sibling keeps the residual; the pair still lands before the reader
var {
    [(_pushMaybeArray(log).call(log, 4), 'flatMap')]: _unused3,
    ...rest
  } = arr,
  fm = _flatMapMaybeArray(arr),
  viaFm = fm;
// for-init head: a later head declarator reads the pair the same way
let out;
for (var {
    [(_pushMaybeArray(log).call(log, 3), 'includes')]: _unused4
  } = arr, inc = _includesMaybeArray(arr), viaInc = inc, i = 0; i < 1; i++) out = viaInc;
export { viaFlat, viaFm, rest, out, log };