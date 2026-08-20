import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// generic alias wraps indexed-access: `type M<U> = C<U>['read']`. follower walks the
// alias chain with accumulated subst (U -> number[]), folds it deeply onto the
// TSIndexedAccessType body before the method-shape peel. without folding `aliased.subst`
// while resolving the call's return type from its annotation, the indexed-access still
// references U at peel time and the type-member lookup can't substitute V at the class-chain hop
class C<V> {
  read(): V {
    return undefined as any;
  }
}
type M<U> = C<U>['read'];
declare const fn: M<number[]>;
_atMaybeArray(_ref = fn()).call(_ref, 0);