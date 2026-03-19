import _forEach from "@core-js/pure/actual/instance/for-each";
function f(el: Element) {
  var _ref;
  _forEach(_ref = el.classList).call(_ref, cls => console.log(cls));
}