// `ConstructorParameters<typeof Bar>[1]` — Bar inherits Foo's constructor through `extends`.
// `resolveParametersParams` walks the superClass chain to find the actual constructor; index
// access picks up the second param (`string`), routing `.at(0)` to String-specific
class Foo { constructor(x: number, y: string) {} }
class Bar extends Foo {}
declare const second: ConstructorParameters<typeof Bar>[1];
second.at(0);
