import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// a mutated hop slot no longer re-enters the global surface - the super-class key declines.
// isolated file: the slot write records file-wide and would poison every hop-leaf row
globalThis.self = fake;
const {
  Array: AM
} = globalThis.self;
class QM extends AM {
  static m(iter) {
    return super.from(iter);
  }
}
export const viaMutatedHop = QM.m(seq);