// legacy decorator (Stage 1) on class - babel preserves @decorator syntax. plugin must
// not crash on the syntax even though decorators themselves don't trigger polyfills.
// runtime `.flat()` inside method gets polyfilled normally
function logged(target: any) { return target; }
@logged
class Items {
  flatten(arr: number[][]) { return arr.flat(); }
}
new Items().flatten([[1], [2]]);
