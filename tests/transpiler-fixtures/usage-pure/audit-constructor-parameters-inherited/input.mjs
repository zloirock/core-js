// ConstructorParameters<typeof Sub> where Sub has no own constructor: TS picks up
// Base's constructor. resolveParametersParams walks superClass chain via
// resolveRuntimeExpression. probe whether inherited ctor params resolve correctly,
// AND whether the resolved tuple element receives proper Array narrowing.
class Base {
  constructor(items: number[], names: string[]) {}
}
class Sub extends Base {}
type FirstArg = ConstructorParameters<typeof Sub>[0];
type SecondArg = ConstructorParameters<typeof Sub>[1];
declare const numbers: FirstArg;
declare const labels: SecondArg;
const a = numbers.at(-1);
const b = labels.findLast(s => s.length > 0);
export { a, b };
