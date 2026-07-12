// a DOTTED namespace (`namespace X.Y {}`) whose first segment collides with a class name
// exports on `X.Y`, not `X`, so it declares no shadow of X's static: the `this.<field>` read
// keeps its type-specific narrow. babel@7 nests the dotted form (body is a NESTED module,
// not a statement block), which a bare body-iteration crashed over - the shadow census must
// step over it safely and reach the same verdict on every parser
class Narrowed {
  static list: number[] = [1, 2];
  static read() { return this.list.at(0); }
}
namespace Narrowed.Inner {
  export const list = 3;
}

// a NON-dotted namespace merge declaring the same-named static DOES shadow it: `this.<field>`
// widens to the generic instance helper (a merged runtime static can hold a wider type)
class Shadowed {
  static tags: string[] = ['a'];
  static read() { return this.tags.at(0); }
}
namespace Shadowed {
  export const tags = 5;
}
