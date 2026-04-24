import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// InstanceType<typeof Cls> - resolveTypeQueryBinding + getTypeMembers InstanceType branch.
// Here `C` has a .list property (array). Instance type should route to class members.
class C {
  list: string[] = [];
}
declare const x: InstanceType<typeof C>;
_atMaybeArray(_ref = x.list).call(_ref, -1);