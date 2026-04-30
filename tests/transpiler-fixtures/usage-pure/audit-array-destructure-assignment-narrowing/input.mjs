type Foo = { kind: 'a'; data: string[] } | { kind: 'b'; data: number };

function take(init: Foo) {
  let f: Foo = init;
  [f] = [{ kind: 'a', data: ['x'] } as Foo];
  return f.data.at(0);
}
