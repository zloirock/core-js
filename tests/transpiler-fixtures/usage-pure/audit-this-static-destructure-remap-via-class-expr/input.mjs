const ClassExpr = class extends Array {
  static m() { const { from: ce } = this; return ce; }
};
export const viaClassExpr = ClassExpr.m();
