import _Array$from from "@core-js/pure/actual/array/from";
// caller-arg passes through SE-prefix default. multiple call sites verify the contract:
//   `probe()` / `probe(undefined)` - default fires, polyfill wins
//   `probe({from: customFn})` - caller arg wins, customFn used
// synth-swap replaces the SE tail with `{from: _polyfill}` while leaving the SE prefix
// expressions in place; default destructures the synth literal only when caller-arg is
// undefined, never when caller passed an object
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