import _at from "@core-js/pure/actual/instance/at";
var _ref;
// two module-wide writes assign incompatible types (Array vs string) to the same open-typed
// static field. union-incompatible candidates collapse to null - polyfill dispatch can't pick
// a narrow at-receiver and routes to generic `_at` instead of unsoundly preferring the last
// seen array write
class Foo {
  static bar: any = null;
}
Foo.bar = [1, 2];
Foo.bar = "str";
_at(_ref = Foo.bar).call(_ref, 0);