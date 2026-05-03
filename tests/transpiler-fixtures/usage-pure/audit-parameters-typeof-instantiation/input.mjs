// Parameters<typeof fn<string>> - TS 4.7+ instantiation expression. The TSTypeQuery
// arg carries typeArguments on its inner exprName. resolveParametersParams uses
// resolveTypeQueryBinding which only takes the bare param. Probe whether
// instantiation type-args propagate to params.
declare function pluck<T>(items: T[], key: T): T[];
type FirstArg = Parameters<typeof pluck<string>>[0];
declare const arr: FirstArg;
const head = arr.at(0);
const idx = arr.findLastIndex(s => s.length > 0);
export { head, idx };
