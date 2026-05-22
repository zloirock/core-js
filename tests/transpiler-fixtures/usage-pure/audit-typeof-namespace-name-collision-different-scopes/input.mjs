// two sibling namespaces declare a function with the same name. each
// `typeof <ns>.fn` reference must collect only its own namespace's overload
// signatures - cross-namespace bleed would let A's overload tail return a
// shape that belongs to B, polluting receiver narrowing. distinct instance
// methods per receiver mark which namespace path actually resolved.
declare namespace A {
  function fn(x: string): string;
  function fn(x: boolean): string[];
}
declare namespace B {
  function fn(x: number): number;
  function fn(x: bigint): number[];
}
type RA = ReturnType<typeof A.fn>;
type RB = ReturnType<typeof B.fn>;
declare const ra: RA;
declare const rb: RB;
ra.at(0);
rb.includes(0);
