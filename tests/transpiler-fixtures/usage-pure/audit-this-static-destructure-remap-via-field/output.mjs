import _Array$of from "@core-js/pure/actual/array/of";
class FieldInit extends Array {
  static p = (() => {
    const of = _Array$of;
    return of;
  })();
}
export const viaField = FieldInit.p;