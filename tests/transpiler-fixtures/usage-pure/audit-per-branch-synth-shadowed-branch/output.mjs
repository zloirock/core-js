import _Array$from from "@core-js/pure/actual/array/from";
// per-branch synth-swap when one branch identifier is shadowed by a local binding.
// `Iterator` is the user's wrapper here; only the `Array` branch should fire as
// `{from: _Array$from}`, and the shadowed `Iterator` branch must stay raw so the user's
// wrapper still routes through the destructure pattern at runtime
{
  const Iterator = MyIteratorWrapper;
  function f({
    from
  } = cond ? {
    from: _Array$from
  } : Iterator) {
    return from([1, 2, 3]);
  }
  f();
}
export {};