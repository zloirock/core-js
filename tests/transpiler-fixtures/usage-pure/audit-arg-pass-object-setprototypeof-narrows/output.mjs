import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Object.setPrototypeOf(o, proto)` rewires the [[Prototype]] internal slot but does not
// touch any own property of `o`. our type tracking only models OWN properties (the
// ObjectExpression literal entries, `this.X = ...` writes inside methods, and module-wide
// `<binding>.X = Y` writes via the alias closure - all of which create / mutate own slots);
// inherited slots aren't tracked at all. since OWN always shadows inherited at read time,
// rewiring the prototype can't change the type of `o.arr`. setPrototypeOf carries no
// `mutatesArgument` annotation - classifier returns 'trivial', narrowing on `arr` survives
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    Object.setPrototypeOf(o, null);
    const a = _atMaybeArray(_ref = this.arr).call(_ref, 0);
    const b = _includesMaybeArray(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();