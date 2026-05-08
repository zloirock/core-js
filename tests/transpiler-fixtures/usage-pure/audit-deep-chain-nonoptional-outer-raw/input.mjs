// 4-deep chain with NO optional - element-tracking resolves outer receiver to `number`,
// which has no `.at`; both babel and unplugin intentionally leave outer `.at(0)` raw.
// chain-depth coverage: same `.at` per level is intentional, drives chain-walker reach
const arr = [[[1]], [[2]]];
arr.at(0).at(0).at(0).at(0);
