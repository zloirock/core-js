import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// interface I extends NS.Base - namespace-qualified extends. parent ref resolution via
// segment-based findTypeDeclaration finds the Base interface inside NS, member walk
// then sees Base's structural members and the array-typed `items` property narrows
namespace NS {
  export interface Base {
    items: number[];
  }
}
interface I extends NS.Base {}
declare const i: I;
_includesMaybeArray(_ref = i.items).call(_ref, 1);