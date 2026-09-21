import _Array$from from "@core-js/pure/actual/array/from";
// A static block can capture a nested static after another static block.
// The binding remains scoped to the block containing the pattern.
let captured;
class Holder {
  static {
    Holder.first = 1;
  }
  static {
    const {
      Array: {
        from
      }
    } = {
      Array: {
        from: _Array$from
      }
    };
    captured = from([2]);
  }
}
Holder;
export { captured };