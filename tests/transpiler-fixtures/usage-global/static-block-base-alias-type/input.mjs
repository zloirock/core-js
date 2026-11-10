// The base alias and inherited field belong to this static block.
class Box {
  static {
    class Base { value = 'alice'; }
    const Parent = Base;
    class Item extends Parent {}
    new Item().value.at(-1);
  }
}
