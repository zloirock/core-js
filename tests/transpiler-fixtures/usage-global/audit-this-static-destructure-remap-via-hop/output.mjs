import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
// a nested pattern hopping THROUGH the static still injects its module - the hop read
// itself needs the polyfilled global
class HopStatic extends Promise {
  static m() {
    const {
      try: {
        length
      }
    } = this;
    return length;
  }
}
export const viaHop = HopStatic.m();