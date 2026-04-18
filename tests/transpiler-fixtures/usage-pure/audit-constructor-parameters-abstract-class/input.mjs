// `abstract class` carries a real `constructor` method in body - the walker ignores the
// abstract flag and still reads params like a regular class
abstract class Foo { constructor(x: string = 'a') {} }
declare const args: ConstructorParameters<typeof Foo>;
args.at(0)?.at(-1);
