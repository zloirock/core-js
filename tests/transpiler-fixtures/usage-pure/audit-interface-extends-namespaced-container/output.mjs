import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// type-position namespaced interface extends: `interface I extends NS.Container<T>`.
// resolving the parent must walk the qualified segments so MyBox.items resolves through
// `NS.Container<string>.items` -> T[] -> string[]. without namespaced support the parent
// walk bails and `.at` falls to the generic dispatch instead of the array polyfill
declare namespace NS {
  interface Container<T> {
    items: T[];
  }
}
interface MyBox extends NS.Container<string> {}
declare const b: MyBox;
_atMaybeArray(_ref = b.items).call(_ref, 0);