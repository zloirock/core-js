import _includes from "@core-js/pure/actual/instance/includes";
// A literal receiver keeps outer key effects even though its property value can be paired.
// The nested method reads that value only after both computed keys have evaluated.
export function literal(receiver, outer, leaf) {
  const {
      [(outer(), 'w')]: _ref
    } = {
      w: receiver
    },
    method = null == _ref ? _ref[""] : (leaf(), _includes(_ref));
  return method;
}