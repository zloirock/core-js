// The wrapper captures the receiver before a neighbour can replace its binding.
// Both nested method reads use that original value after the neighbour's effect.
export function replaced(receiver, other) {
  for (let [{ w: { values }, y: { at } }] = [receiver, receiver = other]; ;) return [values, at];
}
