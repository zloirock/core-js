// `class C<V> { firstC(): V }` instantiated via `const x: C<string[]>` - the method's
// return-type references the class type-param `V`. Without threading the receiver's
// type-args through `resolveClassMember -> findClassMember -> resolveReturnType`, V
// stays unresolved and downstream `.at(0)` falls back to the generic instance polyfill.
// Threading subst lets the resolver pick the array-specific dispatch
class C<V> {
  firstC(): V {
    return undefined as any;
  }
}
declare const x: C<string[]>;
x.firstC().at(0);
