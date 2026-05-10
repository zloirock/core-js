// namespace-qualified extends with type-args: `interface S extends NS.Box<number[]>`.
// generic substitution applies through the resolved parent declaration so methods
// on `value` field narrow to the array variant
namespace NS { export interface Box<T> { value: T } }
interface S extends NS.Box<number[]> {}
declare const s: S;
s.value.includes(1);
