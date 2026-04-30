// 5 chained instance polyfills in a single arrow body - stress test for
// sortInnersInnermostLast + nth-occurrence accounting + dups handling
const f = x => arr.flat().at(0).findLast(p).findLastIndex(p2).includes(z);
