// rest-param on class `constructor` - same shape as function rest, requires descent into
// `body.body` + `effectiveParam` unwrap to propagate element type T
class Foo { constructor(...xs: string[]) {} }
declare const args: ConstructorParameters<typeof Foo>;
args.at(0)?.at(-1);
