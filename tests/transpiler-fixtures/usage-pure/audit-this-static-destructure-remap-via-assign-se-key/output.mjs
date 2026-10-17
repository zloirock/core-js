import _Array$of from "@core-js/pure/actual/array/of";
let counted = 0;
let seTarget;
class AssignSeKey extends Array {
  static m() {
    ({} = this), counted++, seTarget = _Array$of;
    return seTarget;
  }
}
export const viaAssignSeKey = AssignSeKey.m();