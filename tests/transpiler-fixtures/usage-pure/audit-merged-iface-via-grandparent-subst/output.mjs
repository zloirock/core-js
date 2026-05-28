import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// 3-level class chain with merged interface on grandparent. The super-class walker
// must substitute raw super-args (`Mid extends Base<T>`) with the current hop's
// active subst before propagating them as receiverArgs for the next iteration's
// merged-iface lookup. Without that, Base's iface receives the raw [T] and items
// resolves to a dangling type-param ref instead of the concrete string
class Base<U> {}
interface Base<U> {
  items: U;
}
class Mid<T> extends Base<T> {}
class Sub extends Mid<string> {}
export function foo(sub: Sub) {
  var _ref;
  return _atMaybeString(_ref = sub.items).call(_ref, 0);
}