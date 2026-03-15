function test(x: string | number[]) {
  if (typeof x === 'string') {
    x = ['reassigned'];
    x.at(0).includes('a');
  }
}
