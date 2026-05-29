import "core-js/modules/es.array.at";
// a Flow `declare class` parent carries its members on a Flow object-type body, not a class
// body. resolving the inherited method's return type through that parent narrows `.at` to the
// Array-only polyfill instead of the general Array + String set
declare class Base {
  items(): Array<number>
}
class Sub extends Base {}
new Sub().items().at(0);