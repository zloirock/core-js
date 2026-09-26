// nested blocks: `let Map` in the INNERMOST block binds only there. references in the
// MIDDLE block (outside the inner) AND outside the outer block must polyfill. exercises
// the "smallest containing block" tie-break: a use-site in the middle block does NOT
// match the inner's range, so it falls through to the (absent) outer binding.
@(function () {
  if (Math.random() > 0.5) {
    new Map();
    if (Math.random() > 0.5) {
      let Map = null;
      void Map;
    }
    new Map();
  }
  return new Map();
})
class C {}
[C];
