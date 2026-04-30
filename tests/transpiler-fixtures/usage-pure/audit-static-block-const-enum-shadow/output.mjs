// `const enum` is a TS runtime binding (tsc inlines references but the declaration
// itself is a runtime shadow until that pass runs - `isTSRuntimeBindingDeclaration`
// accepts both `enum` and `const enum` provided neither is `declare`-modified)
let captured: unknown;
class C {
  static {
    const enum Set {
      Foo,
      Bar,
    }
    captured = Set.Foo;
  }
}
export { C, captured };