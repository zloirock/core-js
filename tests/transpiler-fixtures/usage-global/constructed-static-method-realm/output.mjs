import "core-js/modules/es.global-this";
// A static class method is not a constructor after aliasing either.
// Its returned realm does not make the invalid new expression discardable.
class Owner {
  static make() {
    return globalThis;
  }
}
const A = Owner.make;
use(new A().Array.from);