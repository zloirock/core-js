// some parsers emit a `typeArguments` field on generic CallExpressions; the AST walker
// must descend through child node properties without tripping on that extra metadata
@foo
class C {
  m() { return fn<string>(Array.from(src)); }
}
