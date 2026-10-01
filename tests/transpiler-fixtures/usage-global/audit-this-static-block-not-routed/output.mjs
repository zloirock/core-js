import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
// `this` in a static block (`class { static { this.X(); } }`) is the constructor at runtime -
// same value as static `this` in static methods. dispatch routes ThisExpression in static
// context through the inherited-static path, emitting `es.promise.try` symmetric with `super.try`
class C extends Promise {
  static {
    this.try(() => 1);
  }
}