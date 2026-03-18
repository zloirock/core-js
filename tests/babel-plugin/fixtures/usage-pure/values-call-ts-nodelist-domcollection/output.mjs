import _valuesMaybeDomCollections from "@core-js/pure/actual/dom-collections/instance/values";
function f(list: NodeList) {
  _valuesMaybeDomCollections(list).call(list);
}