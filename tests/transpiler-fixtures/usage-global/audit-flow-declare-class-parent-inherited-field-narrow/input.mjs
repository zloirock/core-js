// a Flow `declare class` parent data field (not a method) is also carried on the Flow
// object-type body; resolving the inherited field type narrows `.at` to Array-only
declare class Base {
  items: Array<number>;
}
class Sub extends Base {}
new Sub().items.at(0);
