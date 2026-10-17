import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
class R7 {
  static M = Object;
}
R7 = {
  M: Promise
};
const {
  withResolvers: viaClassReassign
} = R7.M;
export { viaClassReassign };