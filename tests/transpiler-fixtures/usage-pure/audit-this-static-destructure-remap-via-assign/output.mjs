import _Array$from from "@core-js/pure/actual/array/from";
let picked;
class AssignTarget extends Array {
  static m() {
    picked = _Array$from;
    return picked;
  }
}
export const viaAssign = AssignTarget.m();