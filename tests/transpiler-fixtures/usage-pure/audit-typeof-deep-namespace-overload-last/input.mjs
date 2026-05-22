// deep nested namespace path. typeof resolution must walk through every
// segment of the qualified name and still collect all sibling overload
// signatures of the leaf function. without that walk the deeper-segment
// receiver narrow stays on the first overload's return and the polyfill
// dispatch picks the wrong helper.
declare namespace A {
  namespace B {
    namespace C {
      function fn(x: string): string;
      function fn(x: number): number[];
    }
  }
}
type R = ReturnType<typeof A.B.C.fn>;
declare const r: R;
r.at(0);
