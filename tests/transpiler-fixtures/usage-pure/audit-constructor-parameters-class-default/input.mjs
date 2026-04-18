// `ClassDeclaration.params` is undefined - params live on the `constructor` method inside
// `body.body`; the Parameters/ConstructorParameters handler must descend there for class
class Foo { constructor(x: string = 'a') {} }
declare const args: ConstructorParameters<typeof Foo>;
args.at(0)?.at(-1);
