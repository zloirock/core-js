// Global-mode control: keep imports and reads while pure checks substitution ownership.
// A class declaration owns its static slots just as an object declaration owns its properties.
// Replacing a field must block a pure substitution and retain global's written-value union.
export function read() {
  class Box { static item = Array; }
  Box.item = { from() { return [9]; } };
  return Box.item.from([1]);
}
