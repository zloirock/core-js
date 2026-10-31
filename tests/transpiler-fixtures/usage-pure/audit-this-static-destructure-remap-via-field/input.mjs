class FieldInit extends Array {
  static p = (() => { const { of } = this; return of; })();
}
export const viaField = FieldInit.p;
