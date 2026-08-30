import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$entries from "@core-js/pure/actual/object/entries";
// a flatten slot whose extractions already render the declarator's init - a routed receiver memo,
// a rendered sibling, an SE-key pair the slot took over - must not have that init's sequence
// prefix lifted a second time, and a slot mutated after the fact keeps the entries the other
// channels routed into it: rebuilding the record from scratch dropped a sibling's polyfill
let k = 0;
let k4 = 0;
function log() {}
function eff() {}
function getArr() {
  return [1];
}
const from = _Array$from;
const _ref = (log(), getArr());
const at = _atMaybeArray(_ref);
const concat = _concatMaybeArray(_ref);
const of = _Array$of;
const _ref2 = getArr();
const {
    indexOf,
    [(k++, 'flat')]: _unused
  } = _ref2,
  fl = _flatMaybeArray(_ref2);
eff();
var of4 = _Array$of;
var f4 = _Object$entries;
var {
  [(k4++, 'of')]: _unused2,
  other4
} = Array;
export { from, at, concat, of, indexOf, fl, f4, of4, other4 };