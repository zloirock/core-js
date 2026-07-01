import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// ConstructorParameters<typeof Sub> where Sub has no own constructor: TS picks up
// Base's constructor. constructor-parameter resolution walks the superClass chain via
// the runtime-expression resolver. probe whether inherited ctor params resolve correctly,
// AND whether the resolved tuple element receives proper Array narrowing.
class Base {
  constructor(items: number[], names: string[]) {}
}
class Sub extends Base {}
type FirstArg = ConstructorParameters<typeof Sub>[0];
type SecondArg = ConstructorParameters<typeof Sub>[1];
declare const numbers: FirstArg;
declare const labels: SecondArg;
const a = _atMaybeArray(numbers).call(numbers, -1);
const b = _findLastMaybeArray(labels).call(labels, s => s.length > 0);
export { a, b };