import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `T['method']` indexed-access on a generic class type extracts the method's function-type
// (`() => V`), not its return-type. Combined with class type-arg substitution, the alias
// `Method = C<string[]>['firstC']` must resolve to `() => string[]` so `fn()` returns the
// substituted `string[]` and `.at(0)` narrows to the array-specific polyfill. covers Layer 1
// (substMembers walks ESTree MethodDefinition.value.returnType under class subst) and Layer 2
// (resolveIndexedAccessMemberAnnotationAST treats method-shaped members as function-types)
class C<V> {
  firstC(): V {
    return undefined as any;
  }
}
type Method = C<string[]>['firstC'];
declare const fn: Method;
_atMaybeArray(_ref = fn()).call(_ref, 0);