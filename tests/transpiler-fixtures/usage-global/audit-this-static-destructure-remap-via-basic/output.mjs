import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
class Basic extends Array {
  static m() {
    const {
      from
    } = this;
    return from;
  }
}
export const viaBasic = Basic.m();