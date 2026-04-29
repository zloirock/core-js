// destructure assignment with a side-effect-bearing receiver and two polyfill-eligible
// outer props without rest spread. the side effect lifts as a standalone statement before
// the polyfill assigns; the empty destructure is removed (no consumers left)
let from, fromEntries;
({ Array: { from }, Object: { fromEntries } } = (sideEffect(), globalThis));
