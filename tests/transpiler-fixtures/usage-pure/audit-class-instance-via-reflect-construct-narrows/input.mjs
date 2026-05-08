// `Reflect.construct(C, args)` returns an instance of C, structurally equivalent to
// `new C(...args)`. before the fix, resolveClassContext only recognised NewExpression -
// member access on a Reflect.construct result fell to generic dispatch. after the fix,
// the call is classified as a class instantiation and `inst.method()` resolves through
// the class body the same way the new-expression path does
class Box {
  fetchItems() {
    return [1, 2, 3];
  }
}

const inst = Reflect.construct(Box, []);
const arr = inst.fetchItems();
const head = arr.at(0);
export { head };
