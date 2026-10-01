// array-destructure assignment `[f] = [...]` rebinds `f` to the new element. the
// reassigned value's discriminant must drive the narrow at the use site, so
// `f.data.at(0)` picks string-array dispatch from the new `kind: 'a'` branch
type Foo = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };

function take(init: Foo) {
  let f: Foo = init;
  [f] = [{ kind: 'a', data: ['x'] } as Foo];
  return f.data.at(0);
}
