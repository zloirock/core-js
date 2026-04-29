import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// InstanceType<typeof Cls> - the type-query binding resolves to class C, then the
// InstanceType utility-type member lookup routes to the class instance members.
// Here `C` has a .list property (array), so `.at(-1)` resolves array-typed.
class C {
  list: string[] = [];
}
declare const x: InstanceType<typeof C>;
_atMaybeArray(_ref = x.list).call(_ref, -1);