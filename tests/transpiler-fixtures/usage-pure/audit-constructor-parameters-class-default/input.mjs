// `ConstructorParameters<typeof Foo>` on a class with a default-valued constructor param.
// unlike functions, class constructor params live on the `constructor` method inside the
// class body, not on the class node itself. plugin descends into the body to find them,
// and peels the AssignmentPattern (default-value) wrapper to recover the declared type
class Foo { constructor(x: string = 'a') {} }
declare const args: ConstructorParameters<typeof Foo>;
args.at(0)?.at(-1);
