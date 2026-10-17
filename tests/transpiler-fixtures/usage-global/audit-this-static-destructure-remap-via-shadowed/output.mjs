import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
class Shadowed extends Promise {
  static any() {
    return 1;
  }
  static m() {
    const {
      any
    } = this;
    return any;
  }
}
export const viaShadowed = Shadowed.m();