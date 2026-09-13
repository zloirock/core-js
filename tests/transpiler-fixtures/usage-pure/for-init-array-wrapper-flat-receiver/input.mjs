// Several flat claims dispatch on the paired element, even when an effect keeps its wrapper.
// A memo of the surrounding array would select array methods instead of the receiver's own ones.
export function flat(receiver, effect) {
  for (let [{ values, at }] = [receiver, effect()]; ;) return [values, at];
}
