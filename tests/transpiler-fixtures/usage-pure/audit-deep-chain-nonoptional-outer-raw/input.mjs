// 4-deep chain with NO optional - element-tracking resolves outer receiver to `number`,
// which has no `.at`; both babel and unplugin intentionally leave outer `.at(0)` raw.
// paired with `audit-optional-polyfill-chain-crash` which tests the optional counterpart:
// there the chain's `?.` triggers unplugin's generic-fallback retry so outer polyfills
const arr = [[[1]], [[2]]];
arr.at(0).at(0).at(0).at(0);
