// the inherited method return type drives the narrow precisely: a string return narrows
// `.at` to the String-only polyfill, not Array
declare class Base {
  label(): string;
}
class Sub extends Base {}
new Sub().label().at(0);
