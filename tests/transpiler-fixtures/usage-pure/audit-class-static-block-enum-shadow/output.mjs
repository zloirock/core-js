// TS-runtime `enum Map { ... }` declared inside a class static block must shadow the
// global Map. anchor preference in `findTSRuntimeBindingInPath` walks the path's
// parentPath chain and StaticBlock is one of the explicit anchor types in
// `getTSRuntimeBindings`. without StaticBlock anchoring, polyfill emission would fire
// inside the static block's `new Map()` despite the enum binding
let captured: unknown;
class C {
  static {
    enum Map {
      Foo,
      Bar,
    }
    captured = new Map.Foo();
  }
}
export { C, captured };