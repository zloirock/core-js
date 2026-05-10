import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// interface extends namespaced base with type args; substitution must reach members
namespace NS {
  export interface Base<T> {
    items: T[];
  }
}
interface Sub<T> extends NS.Base<T> {}
declare const s: Sub<string>;
_includesMaybeArray(_ref = s.items).call(_ref, 'a');