import _Array$from from "@core-js/pure/actual/array/from";
// oxc emits `typeArguments` on generic CallExpressions; forEachChildNode must descend
// via isASTNode without tripping on that extra metadata field
@foo
class C {
  m() {
    return fn<string>(_Array$from(src));
  }
}