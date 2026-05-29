// `T['method']` indexed-access on a generic class extracts the method's function type
// (`() => V`), not a property type. With the class type argument substituted,
// `C<string[]>['firstC']` resolves to `() => string[]`, so `fn()` returns string[] and
// `.at(0)` narrows to the Array variant.
class C<V> {
  firstC(): V {
    return undefined as any;
  }
}
type Method = C<string[]>['firstC'];
declare const fn: Method;
fn().at(0);
