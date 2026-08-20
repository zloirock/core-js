import _Array$from from "@core-js/pure/actual/array/from";
// synth-swap can't shape-rebuild the receiver when a rest property is present (rest exclusion
// would change), so it bails for this DECLARED function. the lossy fallback is sound only
// because the function is non-exported and every local call keeps the default; exported /
// escaping / overridden functions stay verbatim instead.
function run({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  return from([1]);
}
run();