import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `C<T>['method']` indexed-access used DIRECTLY as binding annotation (no intermediate
// `type Method = ...` alias). exercises the followTypeAliasChain bail-path: the alias
// chain stops at TSIndexedAccessType immediately because there's no alias to follow.
// pins the bare-indexed-access branch of resolveCallReturnTypeFromAnnotation's peel
class C<V> {
  read(): V {
    return undefined as any;
  }
}
declare const fn: C<number[]>['read'];
_atMaybeArray(_ref = fn()).call(_ref, 0);