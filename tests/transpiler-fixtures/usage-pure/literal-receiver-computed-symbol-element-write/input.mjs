// Constructing a literal receiver reads its elements before the computed symbol key.
// A key that writes the element binding cannot change the already selected array.
let value = 'held';
export const result = [value][(value = 'swapped', Symbol.iterator)]().next().value;
