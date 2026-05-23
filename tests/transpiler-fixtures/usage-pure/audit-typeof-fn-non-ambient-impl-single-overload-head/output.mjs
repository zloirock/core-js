import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// single preceding overload head + non-ambient impl. exercises the impl-with-heads branch
// when `findOverloadsForName` returns exactly ONE entry - TS retargets `typeof fn` to that
// head, not the impl. predicate `minHeadsForRetarget=1` for impl is what differentiates
// from ambient-only path which needs >=2 entries (since ambient `resolved` is already one
// of them)
function fn(x: number): number[];
function fn(x: any): any {
  return null as any;
}
const r: ReturnType<typeof fn> = fn(0);
_includesMaybeArray(r).call(r, 0);