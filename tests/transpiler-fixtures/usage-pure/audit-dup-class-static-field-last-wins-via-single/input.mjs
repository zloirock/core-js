// a single static field resolves normally (control)
class Single {
  static K = Map;
}
const { K: { groupBy } } = Single;
export const viaSingle = groupBy([], x => x);
