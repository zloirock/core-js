// oxc emits `typeArguments` on generic CallExpressions; forEachChildNode must descend
// via isASTNode without tripping on that extra metadata field
@foo
class C {
  m() { return fn<string>(Array.from(src)); }
}
