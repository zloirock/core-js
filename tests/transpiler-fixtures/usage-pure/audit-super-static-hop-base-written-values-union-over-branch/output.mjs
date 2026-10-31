// An AMBIGUOUS `extends` base resolves to nothing in pure, so no `super.<static>` here is rewritten: what this file locks is the
// value walk under it - each written arm is substituted where the pure package has an entry for it (`Promise`, `Reflect`, `Map`)
// and left native where it has none (`Array`, `Object`), through every hop spelling the canon walks.

let branchNs = {
  Base: Boolean
};
if (c) branchNs = {
  Base: Array
};
class OverBranch extends branchNs.Base {
  static go() {
    return super.from('ab');
  }
}
export { OverBranch };