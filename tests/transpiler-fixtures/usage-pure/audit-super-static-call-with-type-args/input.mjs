// super.X<T>(args) - static method call with explicit TS type arguments on the super
// callee. replaceGlobalOrStatic's super branch slices between the call expression's
// parentheses to preserve user args, but the slice must skip past the `<T>` block
// (the typeArguments node) when computing the open-paren position. without
// typeArguments awareness, the slice would land on `<` and emit corrupt output.
// pairs static-arg type with usage-pure's super-static path
class C extends Array<number> {
  static collect() {
    return super.from<number>([1, 2, 3]);
  }
}
C.collect();
