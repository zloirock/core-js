// chain-assignment as a MemberExpression receiver: `(a = Array).from([1])` evaluates to
// the receiver value at runtime; the assignment is observable side effect.
// `peelChainAssignment` recovers the rhs constructor for classification AND extracts the
// `=` chain for re-emission as a SequenceExpression prefix:
//   - line 1: static-method dispatch drops receiver, so the assignment chain is added to
//     side effects -> `(a = Array, _Array$from)([1])` preserves both polyfill + assignment
//   - line 2: instance-method dispatch routes through `replaceInstanceLike` which captures
//     the assignment via memoize shape `_ref = b = _Map` (no duplication needed)
//   - line 3: plain Array literal receiver, standard memoize
const r = (a = Array).from([1]);
const s = (b = Map).keys();
const t = [1, 2, 3].includes(2);
[r, s, t];
