function test(x: string | number[]) {
  if (typeof x === 'string') {
    x.at(0).bold();
    x = ['reassigned'];
  }
}
