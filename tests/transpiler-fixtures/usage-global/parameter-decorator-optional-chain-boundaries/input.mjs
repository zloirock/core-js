// Parentheses seal optional chains inside parameter decorators too. The call must
// still throw on a null receiver after a non-null assertion or instantiation.
declare function dec(value: unknown): ParameterDecorator;
declare const box: { first(): unknown, second<T>(): unknown } | null;
class C {
  constructor(
    @dec((box?.first)!()) public first: unknown,
    @dec(((box?.second)<number>)()) public second: unknown,
  ) {}
}
