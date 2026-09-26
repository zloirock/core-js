import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `typeof NS.E.A` - namespaced enum member. the typeof-qualified-member resolution only checked
// for an enum declaration when memberPath.length === 1, so member access through one or more
// namespace segments lost the enum-kind narrow ($Primitive('string')). added the
// segments-aware path via a by-segments declaration lookup so any nesting depth resolves
namespace NS {
  export enum E {
    A = 'alpha',
    B = 'beta'
  }
}
declare const v: typeof NS.E.A;
_atMaybeString(v).call(v, 0);