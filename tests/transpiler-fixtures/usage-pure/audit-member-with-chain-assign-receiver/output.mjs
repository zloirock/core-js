import _Array$from from "@core-js/pure/actual/array/from";
import _keys from "@core-js/pure/actual/instance/keys";
import _Map from "@core-js/pure/actual/map/constructor";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// chain-assignment as a MemberExpression receiver: `(a = Array).from([1])` evaluates to
// the receiver value at runtime; the assignment is observable side effect.
// `peelChainAssignment` recovers the rhs constructor for classification AND extracts the
// `=` chain for re-emission as a SequenceExpression prefix:
//   - line 1: static-method dispatch drops receiver, so the assignment chain is added to
//     side effects -> `(a = Array, _Array$from)([1])` preserves both polyfill + assignment
//   - line 2: instance-method dispatch routes through `replaceInstanceLike` which captures
//     the assignment via memoize shape `_ref = b = _Map` (no duplication needed)
//   - line 3: plain Array literal receiver, standard memoize
const r = (a = Array, _Array$from)([1]);
const s = _keys(_ref = b = _Map).call(_ref);
const t = _includesMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 2);
[r, s, t];