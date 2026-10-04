import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// A computed-key instance binding completes in its original declarator slot before a later
// declarator reads it. The key effect runs once before the method read, including exported
// and for-init declarations.
const log = [];
const arr = [1, [2]];
var flat = null == arr ? arr[""] : (_pushMaybeArray(log).call(log, 1), _flatMaybeArray(arr)),
  viaFlat = flat;
// An export host keeps the binding before its later reader without exporting a temporary.
export var at = null == arr ? arr[""] : (_pushMaybeArray(log).call(log, 2), _atMaybeArray(arr)),
  viaAt = at;
var {
    [(_pushMaybeArray(log).call(log, 4), 'flatMap')]: fm,
    ...rest
  } = arr,
  viaFm = fm;
// A later for-init declarator observes the completed method binding the same way.
let out;
for (var inc = null == arr ? arr[""] : (_pushMaybeArray(log).call(log, 3), _includesMaybeArray(arr)), viaInc = inc, i = 0; i < 1; i++) out = viaInc;
export { viaFlat, viaFm, rest, out, log };