// a generic Flow `declare class` parent: the inherited method return type references the
// class type-param, which substitutes to the concrete `extends` arg, narrowing `.at` to Array
declare class Base<T> {
  items(): T[];
}
class Sub extends Base<number> {}
new Sub().items().at(0);
