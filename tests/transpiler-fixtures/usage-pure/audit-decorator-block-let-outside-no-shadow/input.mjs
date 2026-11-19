// `let`/`const` declared inside a nested block bind ONLY within that block. A sibling
// reference outside the block (`new Map()` after the if-block) must still emit the
// polyfill - the decorator-walk frame scope must not flat-collect let/const as fn-level.
@(function () {
  if (Math.random() > 0.5) {
    let Map = null;
    void Map;
  }
  return new Map();
})
class C {}
[C];
