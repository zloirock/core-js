import _globalThis from "@core-js/pure/actual/global-this";
class Nullish extends Array {
  static m({
    of
  } = this ?? _globalThis.Array) {
    return of;
  }
}
export const viaNullish = Nullish.m();