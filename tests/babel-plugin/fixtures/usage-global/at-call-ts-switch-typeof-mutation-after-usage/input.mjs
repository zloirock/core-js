function test(x: string | number[]) {
  switch (typeof x) {
    case 'string':
      x.at(0).strike();
      x = ['reassigned'];
      break;
  }
}
