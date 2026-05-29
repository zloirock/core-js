// `class C extends g.Array<string[]>` where g aliases globalThis via a const. The extends
// base resolves through the alias to the global Array, so instances of C are Array-typed and
// `c.at(0)` narrows to the Array variant.
const g = globalThis;
class C extends g.Array<string[]> {}
const c = new C();
c.at(0);
