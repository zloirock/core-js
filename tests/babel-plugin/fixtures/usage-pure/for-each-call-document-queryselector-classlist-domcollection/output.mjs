var _ref;
import _forEachMaybeDomCollections from "@core-js/pure/actual/dom-collections/instance/for-each";
_forEachMaybeDomCollections(_ref = document.querySelector('.foo').classList).call(_ref, cls => console.log(cls));