import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
let picked;
class AssignTarget extends Array {
  static m() {
    ({
      from: picked
    } = this);
    return picked;
  }
}
export const viaAssign = AssignTarget.m();