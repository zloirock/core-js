import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// sibling declarators in one declaration both inject
class TwoDecl extends Array {
  static m() {
    const {
        from
      } = this,
      {
        of
      } = this;
    return [from, of];
  }
}
export const viaTwoDecl = TwoDecl.m();