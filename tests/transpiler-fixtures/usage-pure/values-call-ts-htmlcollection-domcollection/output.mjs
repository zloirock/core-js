import _valuesMaybeDomCollections from "@core-js/pure/actual/dom-collections/instance/values";
function f(col: HTMLCollection) {
  _valuesMaybeDomCollections(col).call(col);
}