import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// usage-pure labeled WHILE loop whose header needs a `_ref` memo and whose body has a
// `continue <label>`: same broadened shape as the braced-for case. the label must stay on the
// loop or the continue is illegal (V8 rejects it; the oxc runner does not). regression lock
function g(cond) {
  var _ref;
  loop: while (_flatMaybeArray(_ref = [4, 5]).call(_ref)[0]) {
    if (cond) continue loop;
    break;
  }
}
g;