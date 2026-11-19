// A constructor parameter property binds the argument before the generic default.
class Box<T = string> {
  constructor(public value: T) {}
  get(): T { return this.value; }
}
new Box([1, 2]).get().at(-1);
