// single-element user array-wrap stays native; single-element global folds
const only = {
  Map: function () {}
};
const [{
  Map: U
}] = [only];
export const viaSingleUser = U.groupBy([], x => x);