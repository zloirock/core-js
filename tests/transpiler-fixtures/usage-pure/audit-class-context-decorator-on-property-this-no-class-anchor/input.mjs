// Decorator on a class FIELD (not a method): `@deco(this.s.at(0)) field: T = ...`. property
// decorators sit above the ClassProperty/PropertyDefinition slot; walking up traverses
// ... -> Decorator -> ClassProperty -> ClassBody. asserts the boundary check covers all
// class member kinds (methods, fields, accessors) uniformly via the Decorator type match
declare function deco<T>(x: any): (target: T) => T;
class C {
  s: string = "hi";
  @deco(this.s.at(0))
  field: number = 1;
}
