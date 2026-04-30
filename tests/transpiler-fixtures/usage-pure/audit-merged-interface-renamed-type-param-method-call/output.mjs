import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// class+interface merging with renamed type-param, METHOD CALL form. routes through
// `resolveClassMember` -> `resolveMergedInterfaceMember` (different path from property
// access in audit-merged-interface-renamed-type-param). interface method's return uses
// renamed `U`; without per-iface subst remap, `obj.fetch()` falls to generic dispatch
class Box<T> {
  base(): T {
    return null!;
  }
}
interface Box<U> {
  fetch(): U[];
}
declare const box: Box<string>;
_atMaybeArray(_ref = box.fetch()).call(_ref, 0);