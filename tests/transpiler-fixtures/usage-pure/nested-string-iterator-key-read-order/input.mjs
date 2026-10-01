// A computed string resembling a symbol label names an ordinary property.
// The outer receiver and its nested getters are read once in source order.
// An open nested receiver retains its instance polyfill.
export function read(input) {
  const { ['[@@iterator]']: { other, at } } = input;
  return [other, at];
}
