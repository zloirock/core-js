// ForOfStatement opens its own block scope: `let Map` in for-of-left binds to the
// for's range only. outside the for, `new Map()` must polyfill.
@(function () {
  for (let Map of [1, 2]) {
    void Map;
  }
  return new Map();
})
class C {}
[C];
