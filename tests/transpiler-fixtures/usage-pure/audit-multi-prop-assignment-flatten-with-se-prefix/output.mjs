import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// destructure assignment with a side-effect-bearing receiver and two polyfill-eligible
// outer props without rest spread. the side effect lifts as a standalone statement before
// the polyfill assigns; the empty destructure is removed (no consumers left)
let from, fromEntries;
({
  Array: {
    from
  },
  Object: {
    fromEntries
  }
} = (sideEffect(), {
  Array: {
    from: _Array$from
  },
  Object: {
    fromEntries: _Object$fromEntries
  }
}));