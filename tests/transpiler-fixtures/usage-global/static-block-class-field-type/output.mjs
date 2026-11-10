import "core-js/modules/es.string.at";
// A local class binding stays visible to its instance-field analysis.
class Box {
  static {
    class Item {
      value = 'alice';
    }
    const item = new Item();
    item.value.at(-1);
  }
}