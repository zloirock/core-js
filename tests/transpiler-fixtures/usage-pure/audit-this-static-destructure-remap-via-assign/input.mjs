let picked;
class AssignTarget extends Array {
  static m() { ({ from: picked } = this); return picked; }
}
export const viaAssign = AssignTarget.m();
