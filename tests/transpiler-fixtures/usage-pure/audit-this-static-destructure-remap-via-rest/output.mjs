import _Array$of from "@core-js/pure/actual/array/of";
class WithRest extends Array {
  static m() {
    const of = _Array$of;
    const {
      of: _unused,
      ...rest
    } = this;
    return [of, rest];
  }
}
export const viaRest = WithRest.m();