function foo(items) {
  for (const x of items) {
    if (typeof x === 'number') {
      console.log('skipping');
      continue;
    }
    x.at(0);
  }
}
