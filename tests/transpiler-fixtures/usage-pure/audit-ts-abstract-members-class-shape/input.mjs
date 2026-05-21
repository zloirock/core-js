// abstract method / abstract property / abstract accessor are oxc-only node types
// (`TSAbstractMethodDefinition`, `TSAbstractPropertyDefinition`, `TSAbstractAccessorProperty`)
// that translate to babel's `ClassMethod` / `ClassProperty` / `ClassAccessorProperty` via
// `nodeType`. without the translation, class-member shape walks would treat abstract slots
// as unknown nodes - subclass concrete bodies referencing globals (`Array.from`, `Array.of`,
// `Array.isArray`) still emit polyfill imports, but member-shape indexing of the abstract
// names breaks. fixture exercises all three abstract member kinds inside one class
abstract class Container<T> {
  abstract from(x: T[]): Container<T>;
  abstract size: number;
  abstract accessor cursor: number;
}

class IntBag extends Container<number> {
  from(x: number[]): IntBag {
    return new IntBag(Array.from(x));
  }
  size = 0;
  accessor cursor = 0;
  constructor(public items: number[]) {
    super();
    this.size = items.length;
  }
  static factory(): IntBag {
    return new IntBag(Array.of(1, 2, 3));
  }
  contains(v: unknown): boolean {
    return Array.isArray(this.items) && this.items.indexOf(v as number) >= 0;
  }
}
IntBag.factory();
