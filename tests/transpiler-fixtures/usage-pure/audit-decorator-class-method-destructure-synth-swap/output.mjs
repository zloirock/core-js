import _Array$from from "@core-js/pure/actual/array/from";
// class-level decorator combined with a method whose destructure default triggers the
// receiver-rewrite. The decorator expression is visited first (no polyfillables there),
// then the class body is walked and the standard `{ from: _Array$from }` rewrite is
// applied to `method`. Decorator preserved verbatim
@dec
class C {
  method({
    from
  } = {
    from: _Array$from
  }) {
    return from([1]);
  }
}