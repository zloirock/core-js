import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise$try from "@core-js/pure/actual/promise/try";
var _ref, _ref2, _ref3;
// a destructure assignment in ANY slot of a statement-position SequenceExpression is
// split into per-expression statements by the shared minifier-shape pre-pass (statement
// context discards every slot's value, so the split is sound at any position) - the
// emitter then polyfills the standalone statement. the TAIL-only rule once left the
// mid-sequence form native (`from` undefined on engines missing the static)
let from;
from = _Array$from;
use();
export const r1 = _at(_ref = from([3])).call(_ref, 0);
let of2;
pre();
of2 = _Array$of;
post();
export const r2 = _atMaybeArray(_ref2 = of2(4)).call(_ref2, 0);
// rest sibling: the consumed key renames to the sentinel, rest exclusion preserved
let keys, rest;
keys = _Object$keys;
({ keys: _unused, ...rest } = Object);
use(rest);
// a destructure buried in a NESTED sequence slot splits too (fixpoint over the products)
let entries2;
x();
entries2 = _Object$entries;
use();
export const r3 = _atMaybeArray(_ref3 = entries2({ b: 2 })).call(_ref3, 0);
// every statement-list host splits, including a switch-case consequent
let groupBy2;
switch (cond) {
  case 1:
    groupBy2 = _Map$groupBy;
use();
    break;
}
export const r4 = groupBy2;
// class static blocks are statement-list hosts too
class K {
  static {
    let try2;
    try2 = _Promise$try;
use();
    K.r = try2;
  }
}
export { K };
// a VALUE-position sequence is NOT split - its result is consumed, both stay native
export const v = (({ from } = Array), from([5]));