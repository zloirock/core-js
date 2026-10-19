// interface call + construct signatures and a constructor type are bodyless function-signature
// shapes too - the globals named in their params must inject in usage-global
interface Factory {
  (a: Promise<number>): void;
  new (b: Symbol): object;
}
// @ts-expect-error a generic named without its type arguments is the shape under test
type Ctor = new (c: Map<string>) => object;
export type { Factory, Ctor };
