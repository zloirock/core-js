// alias of `Parameters<typeof fn>` followed by numeric index: `type P = Parameters<typeof
// fn>; P[0]`. `findTupleElement` previously checked `resolveParametersParams` against the
// raw alias `P`, which fails the typeRefName == "Parameters" guard and falls through to
// generic `_at`. fix: follow the alias chain BEFORE the Parameters check so `P` resolves
// to the underlying `Parameters<typeof fn>` reference
function fn(xs: string[], n: number): void {}
type FnParams = Parameters<typeof fn>;
declare const xs: FnParams[0];
xs.at(0);
