// Array wrapper neighbours evaluate before the nested methods are read. The loop head
// keeps that evaluation and extracts each method in property order from the paired receiver.
export function trailing(receiver, effect) {
  for (let [{ w: { values }, y: { at } }] = [receiver, effect()]; ;) return [values, at];
}
