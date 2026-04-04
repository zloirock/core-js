function foo(items) {
  for (const x of items) {
    if (typeof x === 'number') continue;
    x.at(0);
  }
}
