// `Reflect.construct(C, args)` is structurally equivalent to `new C(...args)` and yields a `C` instance.
// Class-context resolution must recognise it so member access narrows through the class body.
class Box {
  fetchItems() {
    return [1, 2, 3];
  }
}

const inst = Reflect.construct(Box, []);
const arr = inst.fetchItems();
const head = arr.at(0);
export { head };
