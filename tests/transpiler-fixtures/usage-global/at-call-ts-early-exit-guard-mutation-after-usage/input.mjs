function test(x: string | number[]) {
  if (typeof x !== 'string') return;
  x.at(0).fontcolor('red');
  // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
  x = ['reassigned'];
}
