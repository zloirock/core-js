import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
// class static block
const staticRoot = Promise;
const staticLink = staticRoot;
export class ViaStaticBlockShadow {
  static {
    const staticRoot = {};
    const {
      try: attempt
    } = staticLink;
    ViaStaticBlockShadow.v = attempt;
  }
}