import _at from "@core-js/pure/actual/instance/at";
@dec(_at(arr).call(arr, 0))
class A {
  @dec2(_at(arr).call(arr, 1))
  method() {}
  @dec3(_at(arr).call(arr, 2))
  field = 1;
}