class Nullish extends Array {
  static m({ of } = this ?? globalThis.Array) { return of; }
}
export const viaNullish = Nullish.m();
