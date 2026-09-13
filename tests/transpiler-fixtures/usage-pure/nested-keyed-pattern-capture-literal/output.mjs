import _includes from "@core-js/pure/actual/instance/includes";
// A literal receiver keeps outer key effects even though its property value can be paired.
// The nested method reads that value only after both computed keys have evaluated.
export function literal(receiver, outer, leaf) {
  const _ref2 = {
      w: receiver
    },
    {
      [(outer(), 'w')]: _ref
    } = null == _ref2 ? _ref2[""] : _ref2,
    _ref3 = _ref,
    method = null == _ref3 ? _ref3[""] : (leaf(), _includes(_ref3));
  return method;
}