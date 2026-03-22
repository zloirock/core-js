import _keysMaybeDomCollections from "@core-js/pure/actual/dom-collections/instance/keys";
function f(tokens: DOMTokenList) {
  _keysMaybeDomCollections(tokens).call(tokens);
}