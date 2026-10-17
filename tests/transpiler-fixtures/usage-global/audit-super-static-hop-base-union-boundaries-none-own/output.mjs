import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.epsilon";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.number.is-safe-integer";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.min-safe-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.number.parse-int";
let noneNs = {
  Base: Boolean
};
if (c) noneNs = {
  Base: Number
};
class NoneOwn extends noneNs.Base {
  static go() {
    return super.from('ab');
  }
}
export { NoneOwn };