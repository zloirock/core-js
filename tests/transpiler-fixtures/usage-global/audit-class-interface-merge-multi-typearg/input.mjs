// two-parameter merged class+interface. each receiver type-arg slot must propagate to
// the matching declared param name in the interface body, with method-return shapes
// (union, tuple) cooperating with the existing structural resolution paths
class C<T, U> { construct(): void {} }
interface C<T, U> { mix(): T | U; tup(): [T, U]; }
declare const x: C<string, number[]>;
x.mix();
x.tup()[1].includes(0);
