import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// array-destructure assignment `[f] = [...]` rebinds `f` to the new element. the
// reassigned value's discriminant must drive the narrow at the use site, so
// `f.data.at(0)` picks string-array dispatch from the new `kind: 'a'` branch
type Foo = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };

function take(init: Foo) {
  var _ref;
  let f: Foo = init;
  [f] = [{ kind: 'a', data: ['x'] } as Foo];
  return _atMaybeArray(_ref = f.data).call(_ref, 0);
}