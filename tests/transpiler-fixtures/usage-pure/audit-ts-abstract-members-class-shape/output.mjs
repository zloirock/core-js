import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// abstract method / property / accessor are oxc-only node types
// (`TSAbstractMethodDefinition`, `TSAbstractPropertyDefinition`, `TSAbstractAccessorProperty`)
// that must map to babel's `ClassMethod` / `ClassProperty` / `ClassAccessorProperty` so
// class-member shape walks index them - otherwise the abstract slots read as unknown nodes.
// subclass bodies referencing globals (`Array.from`, `Array.of`, `Array.isArray`) still emit
// polyfill imports; fixture exercises all three abstract member kinds inside one class
abstract class Container<T> {
  abstract from(x: T[]): Container<T>;
  abstract size: number;
  abstract accessor cursor: number;
}
class IntBag extends Container<number> {
  from(x: number[]): IntBag {
    return new IntBag(_Array$from(x));
  }
  size = 0;
  accessor cursor = 0;
  constructor(public items: number[]) {
    super();
    this.size = items.length;
  }
  static factory(): IntBag {
    return new IntBag(_Array$of(1, 2, 3));
  }
  contains(v: unknown): boolean {
    return Array.isArray(this.items) && this.items.indexOf(v as number) >= 0;
  }
}
IntBag.factory();