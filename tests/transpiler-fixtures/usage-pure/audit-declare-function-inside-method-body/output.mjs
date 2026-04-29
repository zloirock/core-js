import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `declare function` inside method body: ambient declaration в class-method scope.
// walk через method body's BlockStatement до statement array - тот же drill что для
// regular function body (RNT1-14-4 family). g().at(0) должен dispatch'иться через
// _atMaybeArray по declared return type number[]
class K {
  m() {
    var _ref;
    declare function g(): number[];
    return _atMaybeArray(_ref = g()).call(_ref, 0);
  }
}
new K();