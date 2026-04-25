// `this` in a static block (`class { static { this.X(); } }`) is the constructor at runtime -
// same value as static `this` in static methods. dispatch routes ThisExpression in static
// context through the inherited-static path, emitting `es.promise.try` symmetric with `super.try`
class C extends Promise {
  static {
    this.try(() => 1);
  }
}
