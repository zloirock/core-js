// `ConstructorParameters<typeof Foo>` on a class with a rest param. rest params in class
// constructors have the same element-type inference as in functions - the collected tuple
// is `string[]`, so `.at(0)?.at(-1)` narrows to String instance polyfill at the inner hop
class Foo { constructor(...xs: string[]) {} }
declare const args: ConstructorParameters<typeof Foo>;
args.at(0)?.at(-1);
