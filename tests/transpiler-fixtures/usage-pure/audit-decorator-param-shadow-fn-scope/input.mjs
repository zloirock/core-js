// fn param shadows global throughout the entire fn body (function-scoped). references
// outside any nested block still see the param binding, so `new Map()` is suppressed
// at every position inside the fn.
@(function (Map) {
  if (Math.random() > 0.5) {
    new Map();
  }
  return new Map();
})
class C {}
[C];
