// an AMBIGUOUS `extends` base keeps its usage-global static union through every hop spelling the
// value canon walks - a container member, a nested container, an alias to the container, an
// optional hop, a class-static slot - and not only through a bare name. the arm the declaration
// starts with owns no static of the read key, so what the alternative owes is the whole observable

let branchNs = { Base: Boolean };
if (c) branchNs = { Base: Array };
class OverBranch extends branchNs.Base {
  static go() { return super.from('ab'); }
}
export { OverBranch };
