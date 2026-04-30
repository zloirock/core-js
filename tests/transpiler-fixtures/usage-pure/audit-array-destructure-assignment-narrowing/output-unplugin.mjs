import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Foo = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };

function take(init: Foo) {
var _ref;
  let f: Foo = init;
  [f] = [{ kind: 'a', data: ['x'] } as Foo];
  return _atMaybeArray(_ref = f.data).call(_ref, 0);
}