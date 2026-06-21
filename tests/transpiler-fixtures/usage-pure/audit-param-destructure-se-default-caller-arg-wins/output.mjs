import _Array$from from "@core-js/pure/actual/array/from";
// caller-arg passes through SE-prefix default. `probe()` / `probe(undefined)` fire the default
// (polyfill wins); `probe({from: customFn})` makes the caller arg win. synth-swap replaces the
// SE tail with `{from: _polyfill}` but keeps the SE prefix in place; the default destructures
// the synth literal only when caller-arg is undefined, never when the caller passed an object.
declare function logCall(): void;
declare function customFn(items: number[]): number[];
function probe({
  from
} = (logCall(), {
  from: _Array$from
})) {
  return from([1, 2]);
}
probe();
probe(undefined);
probe({
  from: customFn
});