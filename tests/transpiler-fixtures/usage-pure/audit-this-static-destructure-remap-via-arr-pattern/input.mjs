class ArrPattern extends Array {
  static m() { const [first] = this; return first; }
}
export const viaArrPattern = ArrPattern.m;
