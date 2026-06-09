// two ADJACENT polyfillable side-effecting computed keys (`from` + `of`). each effect must run in source
// order, so neither key is lifted out: both stay in the residual pattern (values renamed to throwaways)
// and each polyfill is extracted to its own preceding `const`. order eff1(), eff2() preserved, both win
const { [(eff1(), 'from')]: f, [(eff2(), 'of')]: g } = Array;
const doubled = [1, [2]].flat();
