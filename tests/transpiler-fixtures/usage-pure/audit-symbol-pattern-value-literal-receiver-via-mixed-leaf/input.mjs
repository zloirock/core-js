// A plain instance leaf beside a pattern value uses the same captured receiver.
const { [Symbol.iterator]: { length: arity = [6].at(0) }, flat: f } = [1, [2]];
export const viaMixedLeaf = [arity, f];
