// ForStatement opens its own block scope: `let Map` in for-init binds to the for's
// range only. inside the for body the local shadow applies (no polyfill there);
// outside the for the global reference must polyfill.
@(function () {
  for (let Map = 0; Map < 1; Map++) {
    void Map;
  }
  return new Map();
})
class C {}
[C];
