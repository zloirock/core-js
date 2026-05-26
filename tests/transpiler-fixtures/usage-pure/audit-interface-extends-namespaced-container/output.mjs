import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// type-position namespaced interface extends: `interface I extends NS.Container<T>`.
// `resolveInterfaceExtendsParent` walks qualified segments via `collectQualifiedSegments`
// + `findTypeDeclaration` so MyBox.items resolves to `NS.Container<string>.items` -> T[]
// -> string[]. without namespaced support the parent walk bails and `.at` falls to generic
declare namespace NS {
  interface Container<T> {
    items: T[];
  }
}
interface MyBox extends NS.Container<string> {}
declare const b: MyBox;
_atMaybeArray(_ref = b.items).call(_ref, 0);