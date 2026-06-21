// `class Bar extends Foo {}` inherits Foo's constructor, so `ConstructorParameters<typeof Bar>`
// must walk the superClass chain and pick up Foo's first param (`number`) as the tuple element.
// `.at(0)` on `args` stays Array-routed (args is tuple-as-Array); the indexed-access variant
// covers per-param pickup in `audit-constructor-parameters-inheritance-index-access`
class Foo { constructor(x: number, y: string) {} }
class Bar extends Foo {}
declare const args: ConstructorParameters<typeof Bar>;
args.at(0);
