// inherited method through `extends`: child `C<U>` extends parent `B<U[]>`, parent has
// `m(): V`. for `C<number>['m']`, the resolver must walk C's class chain into B with
// receiverArgs `[number]` -> parent-subst `{V: U[]}` -> outer-subst-fold `{V: number[]}`.
// pins buildParentClassSubstFromNodes chaining through the new ClassMethod / MethodDefinition
// SUBST_DISPATCH handlers; without them the inherited method node carries V unchanged
class B<V> {
  m(): V {
    return undefined as any;
  }
}
class C<U> extends B<U[]> {}
type M = C<number>['m'];
declare const fn: M;
fn().at(0);
