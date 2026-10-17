let counted = 0;
let seTarget;
class AssignSeKey extends Array {
  static m() { ({ [(counted++, 'of')]: seTarget } = this); return seTarget; }
}
export const viaAssignSeKey = AssignSeKey.m();
