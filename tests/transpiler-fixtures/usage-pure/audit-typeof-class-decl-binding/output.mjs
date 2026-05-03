import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// resolveBareTypeQueryBinding ClassDeclaration branch: `typeof Helper` resolves
// to the class itself; ReturnType<typeof Helper.factory> walks the class member.
// The bare-identifier extractor must surface ClassDeclaration as a valid binding
// path so downstream member resolution can find static method signatures.
class Helper {
  static factory(): number[] {
    return [1, 2, 3];
  }
}
const r: ReturnType<typeof Helper.factory> = [];
_atMaybeArray(r).call(r, 0);