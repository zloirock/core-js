// `C<T>['method']` indexed-access used DIRECTLY as binding annotation (no intermediate
// `type Method = ...` alias). exercises the type-alias-chain bail-path: the alias
// chain stops at TSIndexedAccessType immediately because there's no alias to follow.
// pins the bare-indexed-access branch of the call-return-type annotation peel
class C<V> {
  read(): V {
    return undefined as any;
  }
}
declare const fn: C<number[]>['read'];
fn().at(0);
