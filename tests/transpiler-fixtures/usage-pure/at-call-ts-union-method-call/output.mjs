var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
interface A {
  read(): number[];
}
interface B {
  read(): number[];
}
declare const x: A | B;
_atMaybeArray(_ref = x.read()).call(_ref, 0);