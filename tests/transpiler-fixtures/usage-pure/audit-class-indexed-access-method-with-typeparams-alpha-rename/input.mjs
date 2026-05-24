// method-local `<W>` typeParameters must shadow outer class subst when names collide.
// `wrap<V>(x: V): V[]` - inner V is the method-local generic, NOT the class's V. without
// dropTypeParamSubst alpha-rename guard in substFunctionType (now reachable from the new
// ClassMethod / MethodDefinition SUBST_DISPATCH handlers), the outer subst `{V: number}`
// would replace the inner V in the return type, producing `number[]` regardless of how
// `wrap` is called. with the guard, inner V stays a free type-param and the call result
// resolves through call-site inference to `string[]` for `wrap("hi")`
class C<V> {
  wrap<V>(x: V): V[] {
    return [x];
  }
}
type M = C<number>['wrap'];
declare const fn: M;
fn('hi').at(0);
