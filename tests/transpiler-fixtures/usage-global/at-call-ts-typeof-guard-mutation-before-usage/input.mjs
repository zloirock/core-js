function test(x: string | number[]) {
  if (typeof x === 'string') {
    // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
    x = ['reassigned'];
    // @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
    x.at(0).includes('a');
  }
}
