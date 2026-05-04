import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Five-segment namespace path through findNamespacedFunctionPath.
// `typeof A.B.C.D.fn` walks moduleNameSegments / startsWithSegments correctly
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
_includesMaybeArray(arr).call(arr, 'x');