import _Array$from from "@core-js/pure/actual/array/from";
// super.X<T>(args) - static super-method call with explicit TS type arguments. the rewrite
// slices between the call's parentheses to preserve user args, but the open-paren search
// must skip past the `<T>` block (the typeArguments node); without that awareness the slice
// lands on `<` and emits corrupt output.
class C extends Array<number> {
  static collect() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
C.collect();