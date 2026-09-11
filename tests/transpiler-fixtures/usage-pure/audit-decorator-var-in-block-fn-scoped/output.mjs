// `var` retains function-scope semantics across the block-aware refactor: a `var Map`
// declared inside a nested block hoists to the fn body, so the outside-block reference
// `new Map()` correctly sees the local shadow and the polyfill is suppressed.
@(function () {
  if (Math.random() > 0.5) {
    var Map = function () {};
  }
  return new Map();
})
class C {}
[C];