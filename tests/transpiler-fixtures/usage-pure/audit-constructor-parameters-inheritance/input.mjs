// `class Bar extends Foo {}` inherits `Foo`'s constructor - `ConstructorParameters<typeof Bar>`
// currently has no explicit `constructor` in Bar's body, so the walker bails to generic
class Foo { constructor(x: number, y: string) {} }
class Bar extends Foo {}
declare const args: ConstructorParameters<typeof Bar>;
args.at(0);
