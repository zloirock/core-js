import _forEachMaybeDomCollections from "@core-js/pure/actual/dom-collections/instance/for-each";
function f(col: HTMLCollection) { _forEachMaybeDomCollections(col).call(col, el => console.log(el)); }