import "core-js/modules/es.array.at";
// The nested pattern reads the computed array slot in the same static block.
class Box {
  static {
    const key = 'items';
    const {
      [key]: {
        at
      }
    } = {
      items: [1, 2]
    };
    at.call([3, 4], -1);
  }
}