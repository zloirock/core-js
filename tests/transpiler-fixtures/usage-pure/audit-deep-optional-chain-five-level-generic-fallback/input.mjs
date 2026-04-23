// 5-deep chain on 3-deep array: levels 4 and 5 bottom out at `number` via element-tracking.
// only the outermost (M5) gets the generic-fallback retry - matches babel's AST-mutation
// re-visit reach which also only re-enters the outermost chain member. M4 stays raw in both
const arr = [[[1]], [[2]]];
arr.at(0)?.at(0).at(0).at(0).at(0);
