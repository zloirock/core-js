// A static block can capture a nested static after another static block.
// The binding remains scoped to the block containing the pattern.
let captured;
class Holder {
  static {
    Holder.first = 1;
  }
  static {
    const { Array: { from } } = globalThis;
    captured = from([2]);
  }
}
Holder;
export { captured };
