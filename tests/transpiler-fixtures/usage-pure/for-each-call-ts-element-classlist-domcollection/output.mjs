import _forEachMaybeDomCollections from "@core-js/pure/actual/dom-collections/instance/for-each";
function f(el: Element) {
  var _ref;
  _forEachMaybeDomCollections(_ref = el.classList).call(_ref, cls => console.log(cls));
}