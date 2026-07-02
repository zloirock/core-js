// `wrap<V>(x: V): V[]` on `class C<V>` - the method-local `<V>` must shadow the outer class
// subst when names collide. without an alpha-rename guard during ClassMethod / MethodDefinition
// substitution, the outer subst `{V: number}` replaces the inner V, forcing `number[]`. with
// the guard inner V stays a free type-param and `wrap("hi")` infers `string[]` from the call site
class C<V> {
  wrap<V>(x: V): V[] {
    return [x];
  }
}
type M = C<number>['wrap'];
declare const fn: M;
fn('hi').at(0);
