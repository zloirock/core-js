import _at from "@core-js/pure/actual/instance/at";
// `class Sub extends (Base as typeof Base) {}` - TS-wrapped extends clause. extendsClauseName
// must peel runtime wrappers at entry so the subclass registers under the canonical Base name
// in `subclassesBySuper`. without the peel, Sub doesn't link to Base's class-instance closure
// and a `new Sub()` write through `s.items = ...` is invisible to Base's field-flow tracker -
// narrow stays Array, polyfill emits `_atMaybeArray` instead of the sound generic `_at`
class Base {
  items = [1, 2, 3];
}
class Sub extends (Base as typeof Base) {}
function probe() {
  var _ref;
  const s = new Sub();
  s.items = "stringified";
  const b = new Base();
  return _at(_ref = b.items).call(_ref, 0);
}
probe();