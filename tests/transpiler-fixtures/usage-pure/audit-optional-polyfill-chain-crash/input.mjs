// optional chain crossing a polyfillable site: the rewrite must not crash on any
// shape of the chain even when the polyfill site is deep in the chain.
// chain-depth coverage: same `.at` per level is intentional, drives chain-walker reach
const arr = [[[1]], [[2]]];
arr.at(0)?.at(0).at(0).at(0);
