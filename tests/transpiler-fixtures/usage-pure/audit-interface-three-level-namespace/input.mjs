// 3-level namespace-qualified extends: `interface I extends A.B.Base`. the segment-
// based type-declaration lookup walks ['A', 'B', 'Base'] through nested namespace scopes
// and recurses into Base's body for member resolution
namespace A { export namespace B { export interface Base { items: number[] } } }
interface I extends A.B.Base {}
declare const i: I;
i.items.includes(1);
