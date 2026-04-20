import _forEachMaybeDomCollections from "@core-js/pure/actual/dom-collections/instance/for-each";
var _ref;
_forEachMaybeDomCollections(_ref = document.querySelector('.foo').classList).call(_ref, cls => console.log(cls));