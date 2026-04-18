// class without explicit constructor - `params` array is empty, so inner type inference
// cannot apply; fallback to generic `$Object('Array')` without inner
class Foo {}
declare const args: ConstructorParameters<typeof Foo>;
args.at(0);
