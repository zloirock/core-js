function test(x: string | number[]) {
  if (typeof x !== 'string') return;
  x.at(0).fontcolor('red');
  x = ['reassigned'];
}
