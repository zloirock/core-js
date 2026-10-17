class WithRest extends Array {
  static m() { const { of, ...rest } = this; return [of, rest]; }
}
export const viaRest = WithRest.m();
