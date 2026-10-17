import _Array$from from "@core-js/pure/actual/array/from";
const ClassExpr = class extends Array {
  static m() {
    const ce = _Array$from;
    return ce;
  }
};
export const viaClassExpr = ClassExpr.m();