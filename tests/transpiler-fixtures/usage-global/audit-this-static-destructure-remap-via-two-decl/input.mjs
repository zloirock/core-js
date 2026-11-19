// sibling declarators in one declaration both inject
class TwoDecl extends Array {
  static m() {
    const { from } = this, { of } = this;
    return [from, of];
  }
}
export const viaTwoDecl = TwoDecl.m();
