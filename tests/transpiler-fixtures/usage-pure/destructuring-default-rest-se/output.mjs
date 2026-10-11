import _Array$from from "@core-js/pure/actual/array/from";
// a static claimed beside object rest, off a receiver behind an effect prefix and under a default that never
// fires (the build serves `Array.from`): the static takes its pure import, the default dropped and the prefix
// still run once ahead of it, while the rest keeps its source and exclusions
const from = (sideEffect(), _Array$from),
  {
    from: _unused,
    ...rest
  } = Array;