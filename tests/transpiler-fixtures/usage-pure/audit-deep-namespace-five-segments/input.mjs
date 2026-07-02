// Five-segment namespace path through the namespaced-function lookup.
// `typeof A.B.C.D.fn` walks the module-name segments correctly
// across deeply nested module declarations.
declare namespace A {
  namespace B {
    namespace C {
      namespace D {
        function fn(): string[];
      }
    }
  }
}
declare const arr: ReturnType<typeof A.B.C.D.fn>;
arr.includes('x');
