// A literal receiver keeps outer key effects even though its property value can be paired.
// The nested method reads that value only after both computed keys have evaluated.
export function literal(receiver, outer, leaf) {
  const { [(outer(), 'w')]: { [(leaf(), 'includes')]: method } } = { w: receiver };
  return method;
}
