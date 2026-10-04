// Nested array wrappers preserve their positions. Neighbour effects run before
// the nested receiver is read, and each method dispatch uses the inner element.
export function nested(receiver, effect) {
  for (let [[{ w: { values }, y: { at } }]] = [[receiver], effect()]; ;) return [values, at];
}
