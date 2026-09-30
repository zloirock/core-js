import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
var _ref2;
// A conditionally reassigned receiver keeps native siblings in property order.
// Capturing an instance sibling permits the middle static to use its identity guard;
// the constructor namespace supplies any static the pattern still reads natively.
let M = _Map;
if (n) M = {
  groupBy: 7,
  name: 'x'
};
const _ref = M,
  {
    a1
  } = _ref,
  s1 = _ref === _Map ? _Map$groupBy : _ref.groupBy,
  nm1 = null == _ref ? _ref[""] : _nameMaybeFunction(_ref);
let P = _Promise;
if (n) P = {};
let a2, t2, nm2;
_ref2 = P, {
  a2
} = _ref2, {
  try: t2
} = _ref2, nm2 = _nameMaybeFunction(_ref2), _ref2;
let I = _Iterator;
if (n) I = {};
const nm3 = _nameMaybeFunction(I);
const f3 = I === _Iterator ? _Iterator$from : I.from;
use(a1, s1, nm1, a2, t2, nm2, nm3, f3);